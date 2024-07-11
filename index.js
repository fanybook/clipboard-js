const ffi = require('ffi-napi');
const ref = require('ref-napi');

// 定义 C 函数原型
const int = ref.types.int;

const mylib = ffi.Library('./libs/mylib.dylib', {
    'Add': [int, [int, int]]
});

// 调用 Add 函数
const result = mylib.Add(2, 3);
console.log(`Result of Add(2, 3): ${result}`);
