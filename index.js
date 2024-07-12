const ffi = require('ffi-napi');
const ref = require('ref-napi');
const fs = require('node:fs');

// 定义 C 函数原型
const int = ref.types.int;
const charPtr = ref.refType('char');
const sizePtr = ref.refType(ref.types.size_t);

// 定义回调函数类型
const callbackType = ffi.Function('void', ['int']);

// 创建回调函数
const callback = ffi.Callback('void', ['int'], (value) => {
    console.log(`Callback called with value666: ${value}`);
});

const mylib = ffi.Library('./libs/mylib.dylib', {
    'Add': [int, [int, int]],
    'ProcessData': ['void', [charPtr, int]],
    // 'LoadImageBytes': [charPtr, []],
    'LoadImageBytes': [charPtr, [sizePtr]],
    'FreeCharMem': ['void', [charPtr]],
    'RegisterCallback': ['void', [callbackType]],
    'TriggerCallback': ['void', []],
});

// 调用 Add 函数
const result = mylib.Add(2, 3);
console.log(`Result of Add(2, 3): ${result}`)

// 准备要传递的数据
const data = Buffer.from('Hello from Node.js');
const length = data.length;
// 调用 ProcessData 函数
mylib.ProcessData(data, length);

loadImageBytes()

// 注册回调函数
mylib.RegisterCallback(callback);

// 触发回调函数
mylib.TriggerCallback();

function loadImageBytes() {
    // 调用 Go 函数并接收返回值
    const sizeBuffer = Buffer.alloc(ref.types.size_t.size);
    const resultPtr = mylib.LoadImageBytes(sizeBuffer);
    const size = ref.readUInt64(sizeBuffer, 0);

    // 将返回的内存指针转换为 Buffer
    const imageBuffer = Buffer.from(ref.reinterpret(resultPtr, size));

    // 保存为文件，例如保存为 example_output.jpg
    fs.writeFileSync('./example_output.png', imageBuffer);

    // 释放内存
    mylib.FreeCharMem(resultPtr);

    console.log(imageBuffer)
}
