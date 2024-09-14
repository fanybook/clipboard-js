const ffi = require('ffi-napi')
const ref = require('ref-napi')

// 基础类型
const CString = ref.types.CString

// 指针类型
const charPtr = ref.refType(ref.types.char)

// 函数类型
const callbackType = ffi.Function('void', ['CString'])

const callLib = ffi.Library('./libcall.dylib', {
  'FreeCharMem': ['void', [charPtr]],

  'AsyncCall': ['void', [CString, CString, callbackType]],
})

function isSerializableObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj) && !containsUnserializableValues(obj)
}

function containsUnserializableValues(obj) {
  for (let key in obj) {
    const value = obj[key]
    if (typeof value === 'function' || typeof value === 'undefined' || typeof value === 'symbol') {
      return true
    }
  }
  return false
}

const callGoApi = (act, data, cb) => {
  const callback = ffi.Callback('void', ['CString'], (value) => {
    try {
      const obj = JSON.parse(value)
      cb(obj)
    } catch (error) {
      cb({})
    }
  })

  try {
    if (!isSerializableObject(data)) {
      throw new Error('invalid call data')
    }

    const dataJson = JSON.stringify(data)
    callLib.AsyncCall(act, dataJson, callback)
  } catch (error) {
    console.log('callGoApi:', error)
  }
}

callGoApi('testApi', { hello: 'world' }, (resp) => {
  console.log(`太棒了，收到从 golang 的异步回调响应 666:`, resp)
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
