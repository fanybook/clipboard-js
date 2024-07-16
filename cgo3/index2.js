const ffi = require('ffi-napi');
const ref = require('ref-napi');
const fs = require('node:fs');

// 定义 C 函数原型
const int = ref.types.int;
const charPtr = ref.refType(ref.types.char);
// const charPtr = ref.refType('char');
// ref.refType('char') 是一个指向 char 类型的指针，这意味着它指向一个单独的字符。
// ref.refType(ref.types.CString) 是一个指向 C 字符串（null 终止的字符数组）的指针。
// const charPtr = ref.refType(ref.types.CString);
const intPtr = ref.refType(ref.types.int);
const sizePtr = ref.refType(ref.types.size_t);

const clipboard = ffi.Library('./libclipboard.dylib', {
    'ClipboardReadText': [charPtr, []],
    'ClipboardReadHTML': [charPtr, []],
    'ClipboardReadRAWD': ['void', [charPtr, intPtr]],
    'ClipboardReadPaths': [charPtr, []],
    'FreeCharMem': ['void', [charPtr]],
});

// ffi 有 bug
// https://github.com/nodejs/node/issues/32463
// https://github.com/node-ffi-napi/node-ffi-napi/issues/71

try {
    const resultPtr = clipboard.ClipboardReadText()
    console.log(666.11, ref.readCString(resultPtr))
    // 释放内存
    clipboard.FreeCharMem(resultPtr);
} catch (e) {
    console.log(666.111, e)
}


try {
    const resultPtr2 = clipboard.ClipboardReadHTML()
    console.log(666.12, ref.readCString(resultPtr2))
    // 释放内存
    clipboard.FreeCharMem(resultPtr2);
} catch (e) {
    console.log(666.121, e)
}
// const resultPtr2 = clipboard.ClipboardReadHTML()
// console.log(666.12, ref.readCString(resultPtr2))
// // 释放内存
// clipboard.FreeCharMem(resultPtr2);

try {
    const resultPtr3 = clipboard.ClipboardReadPaths()
    console.log(666.13, ref.readCString(resultPtr3))
// 释放内存
    clipboard.FreeCharMem(resultPtr3);
} catch (e) {
    console.log(666.131, e)
}


// {
//     // 调用 Go 函数并接收返回值
//     const sizeBuffer = Buffer.alloc(ref.types.size_t.size);
//     const resultPtr = mylib.LoadImageBytes(sizeBuffer);
//     const size = ref.readUInt64(sizeBuffer, 0);
//
//     // 将返回的内存指针转换为 Buffer
//     const imageBuffer = Buffer.from(ref.reinterpret(resultPtr, size));
//
//     // 保存为文件，例如保存为 example_output.jpg
//     fs.writeFileSync('./example_output.png', imageBuffer);
//
//     // 释放内存
//     mylib.FreeCharMem(resultPtr);
//
//     console.log(imageBuffer)
// }


readClipboardData()
function readClipboardData() {
    const dataPtrPtr = ref.alloc(charPtr);
    const lengthPtr = ref.alloc(ref.types.int);

    // 调用 C 函数获取数据
    clipboard.ClipboardReadRAWD(dataPtrPtr, lengthPtr);

    // let result = dataPtr.deref().readCString();
    // console.log('Data:', result);
    // console.log('Length:', lengthPtr.deref());
    console.log(666.14)
    console.log('Length:', lengthPtr.deref());

    const result2 = Buffer.from(ref.reinterpret(dataPtrPtr.deref(), lengthPtr.deref()));
    console.log('Data2:', result2.toString());

    // chatgpt 给了这个，又说避免使用
    // let dataPtr = dataPtrPtr.deref();
    // let dataLength = lengthPtr.deref();
    // let buffer = Buffer.from(dataPtr.readPointer(0, dataLength));
    // // 打印原始字节数据
    // console.log('Data:', buffer.toString());
    // console.log('Length:', dataLength);


    // // 打印结果
    // console.log("Data from C:", data.toString('utf8', 0, length));
    // console.log("Length:", length);

    // 释放 C 中的内存
    clipboard.FreeCharMem(dataPtrPtr.deref());
}
