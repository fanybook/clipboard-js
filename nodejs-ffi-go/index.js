const ffi = require('ffi-napi')
const ref = require('ref-napi')

// 基础类型 | basic type
const CString = ref.types.CString

// 回调函数类型 | callback function type
const callbackType = ffi.Function('void', ['CString'])

// 加载库 | load library
const storageLib = ffi.Library('./storage_kit.dylib', {
  'AsyncCall': ['void', [CString, CString, callbackType]],
})

/**
 * 调用存储接口 | call storage api
 * @param act   string    action slug
 * @param data  string    can serializable object
 * @param cb    function  like (resp) => {}, asynchronous handle response via callback function
 */
const callStorageApi = (act, data, cb) => {
  // 定义一个 c 的回调去包裹 cb | define a callback of c to wrap cb
  // 不需要手动释放：通常情况下，你不需要手动释放 ffi.Callback 生成的函数指针，因为 ffi 模块会自动管理这部分内存。
  // Node.js 垃圾回收：Node.js 会自动进行垃圾回收，因此当没有引用指向 callback 时，它会被自动回收。
  // 最佳实践：如果你确实需要确保资源被释放，可以将 callback 设置为 null 或重新创建一个新的 Callback 对象。
  let callback = ffi.Callback('void', ['CString'], (value) => {
    try {
      const obj = JSON.parse(value)
      cb(obj)
    } catch (error) {
      cb({})
    } finally {
      // 回调完成后释放内存 | free the callback memory after it is no longer needed
      callback = null
    }
  })

  try {
    if (!isSerializableObject(data)) {
      throw new Error('invalid call data')
    }

    const dataJson = JSON.stringify(data)
    storageLib.AsyncCall(act, dataJson, callback)
  } catch (error) {
    console.log('[CallStorageApi]', error)
  }
}

function isSerializableObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj) && !containsUnserializableValues(obj)
}
function containsUnserializableValues(obj) {
  for (let key in obj) {
    const value = obj[key]
    if (typeof value === 'function' || typeof value === 'symbol') {
      //  || typeof value === 'undefined' => key will be omitted
      return true
    }
  }
  return false
}

// test
// ====================================================================================================
// 作为一个导出库，下面的都没用了，直接导出 callStorageApi 即可
callStorageApi('testApi', { hello: 'world' }, (resp) => {
  console.log(`太棒了，收到从 golang 的异步回调响应 666:`, resp)
})
callStorageApi('testApi2', { hello: 'world2' }, (resp) => {
  console.log(`太棒了，收到从 golang 的异步回调响应 777:`, resp)
})

const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// 证明 callGoApi 并不会阻塞 nodejs 后续动作
const start = async () => {
  for (let idx = 0;; idx++) {
    await sleep(500)
    console.log(idx, 'AsyncCall 后续动作 from nodejs')

    // 5s 后退出
    if (idx > 10) {
      break
    }
  }
}
start()

process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting...')
  process.exit() // 强制退出程序
})
