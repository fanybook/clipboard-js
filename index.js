const ffi = require('ffi-napi');
const ref = require('ref-napi');

// 定义 C 函数原型
const int = ref.types.int;
const charPtr = ref.refType('char');

const mylib = ffi.Library('./libs/mylib.dylib', {
    'Add': [int, [int, int]],
    'ProcessData': ['void', [charPtr, int]],
});

// 调用 Add 函数
const result = mylib.Add(2, 3);
console.log(`Result of Add(2, 3): ${result}`)

// 准备要传递的数据
const data = Buffer.from('Hello from Node.js');
const length = data.length;
// 调用 ProcessData 函数
mylib.ProcessData(data, length);
