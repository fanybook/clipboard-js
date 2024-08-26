const ffi = require('ffi-napi');
const ref = require('ref-napi');
const fs = require('node:fs');
const path = require('node:path');

// 定义回调函数类型
const callbackType = ffi.Function('void', ['int']);

// 定义 C 函数原型
const CInt = ref.types.int;
const CString = ref.types.CString;

const charPtr = ref.refType(ref.types.char);
// const charPtr = ref.refType('char');
// ref.refType('char') 是一个指向 char 类型的指针，这意味着它指向一个单独的字符。
// ref.refType(ref.types.CString) 是一个指向 C 字符串（null 终止的字符数组）的指针。
// const charPtr = ref.refType(ref.types.CString);
const intPtr = ref.refType(ref.types.int);
const sizePtr = ref.refType(ref.types.size_t);

// 还差写入
const clipboardLib = ffi.Library('./libclipboard.dylib', {
    'FreeCharMem': ['void', [charPtr]],
    'ClipboardSequenceNumber': ['int', []],

    'ClipboardReadText': [charPtr, []],
    'ClipboardReadHTML': [charPtr, []],
    'ClipboardReadRAWD': ['void', [charPtr, intPtr]],
    'ClipboardReadPaths': [charPtr, []],
    'ClipboardReadImage': ['void', [charPtr, intPtr]],

    'ClipboardWrite': ['void', [CString]],
    'ClipboardWriteText': ['void', [CString]],
    'ClipboardWriteHTML': ['void', [CString]],
    'ClipboardWriteRAWD': ['void', [charPtr, CInt]],
    'ClipboardWritePaths': ['void', [CString]],
    'ClipboardWriteImage': ['void', [charPtr, CInt]],

    // 'ClipboardWatch': ['void', [callbackType]],
    // 'ClipboardWatchStart': ['void', []],
});

// console.log(JSON.stringify({
//     text: '你好',
//     html: '<p>世界</p>',
//     rawd: Array.from(new Uint8Array(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]))),
// }))
//
// // 单次写入的，只支持这三种类型
// clipboardLib.ClipboardWrite(JSON.stringify({
//     text: '你好',
//     html: '<p>世界</p>',
//     rawd: Array.from(new Uint8Array(Buffer.from('hello rawd666!'))),
// }))

// writeMany 只支持三种类型，text、html、rawd，通过 json 的形式传给动态库
// 也就是说同时写入的类型只能是三种，其他类型只能单次写入一种
// rawd 只能是以字节码数组的方式传输，编码成 json 可能会变大很多，所以在调 writeMany 时这个属性最好不要太大
//      如果是用 base64 编码，也会增加约 33% 的大小
// 例：Array.from(new Uint8Array(Buffer.from('hello rawd666!')))
const writeMany = (dataMap) => {
    try {
        const supportedTypes = ['text', 'html', 'rawd']
        for (const typ in dataMap) {
            if (!supportedTypes.includes(typ)) {
                delete dataMap[typ]
            }

            if (typ === 'rawd') {
                // if (!Array.isArray(dataMap[typ])) {
                //     delete dataMap[typ]
                // }
                if (!(dataMap[typ] instanceof Buffer)) {
                    delete dataMap[typ]
                } else {
                    // 变成 Uint8 数字后再编码成 json 体积会变大很多
                    dataMap[typ] = Array.from(new Uint8Array(dataMap[typ]))
                    // dataMap[typ] = dataMap[typ].toString('base64')
                }
            } else {
                if (typeof dataMap[typ] !== 'string') {
                    delete dataMap[typ]
                }
            }
        }

        // 单次同时写入多种类型
        clipboardLib.ClipboardWrite(JSON.stringify(dataMap))
    } catch (e) {
        console.log(e)
    }
}
// writeMany({
//     text: '你好',
//     html: '<p>世界</p>',
//     // 'hello rawd666!' 在变成 Uint8 数字后再编码成 json 体积会变大很多
//     rawd: Buffer.from('hello rawd666!'),
// })

// // 创建回调函数
// const callback = ffi.Callback('void', ['int'], (value) => {
//     console.log(`Callback called with value666: ${value}`);
// });
// clipboardLib.ClipboardWatch(callback);

// function startWatch() {
//     return new Promise((resolve, reject) => {
//         const callback = ffi.Callback('void', ['int'], function(result) {
//             console.log(`Callback called with value777: ${result}`);
//             // resolve(result);
//         });
//
//         clipboardLib.ClipboardWatch(callback);
//
//         resolve()
//     });
// }
//
// startWatch()
// setTimeout(async function() {
//     clipboardLib.ClipboardWatch(callback);
// }, 1000);

// // 要读取的图片文件路径
// const imagePath = path.join(__dirname, 'example_output.png');
// // 读取图片文件并转换为 Buffer
// fs.readFile(imagePath, (err, data) => {
//     if (err) {
//         console.error('Error reading file:', err);
//         return;
//     }
//
//
//     clipboardLib.ClipboardWriteImage(data, data.length)
//     // // data 是 Buffer 对象，表示文件内容
//     // console.log('Buffer length:', data.length);
//     // console.log('Buffer:', data);
// });

const writeText = (text) => {
    try {
        clipboardLib.ClipboardWriteText(text)
    } catch (e) {
        console.log(e)
    }
}
// console.log(444.111, writeText('美女，你好'))
//
const writeHTML = (html) => {
    try {
        clipboardLib.ClipboardWriteHTML(html)
    } catch (e) {
        console.log(e)
    }
}
// console.log(444.112, writeHTML('<p>Hello from <span style="color: red;">Node.js</span></p>'))
//
const writePaths = (paths) => {
    try {
        // TODO: 是否验证路径存在
        //       是否对 paths 格式有要求
        clipboardLib.ClipboardWritePaths(paths)
    } catch (e) {
        console.log(e)
    }
}
// console.log(444.113)
//
const writeImage = (imageBuffer) => {
    try {
        if (imageBuffer instanceof Buffer) {
            clipboardLib.ClipboardWriteImage(imageBuffer, imageBuffer.length)
        }
    } catch (e) {
        console.log(e)
    }
}
// console.log(444.114)

const writeRAWD = (dataBuffer) => {
    try {
        if (dataBuffer instanceof Buffer) {
            clipboardLib.ClipboardWriteRAWD(dataBuffer, dataBuffer.length)
        }
    } catch (e) {
        console.log(e)
    }
}
// console.log(444.115, writeRAWD(Buffer.from('Hello from Node.js')))
// Buffer.from('Hello from Node.js')
// clipboardLib.ClipboardWriteText('Hello from Node.js')
// clipboardLib.ClipboardWritePaths('/Users/admin/Pictures/003235-171069315532ac.jpeg;/Users/admin/Pictures/报纸墙 长卷发 大波浪 可爱动漫美女壁纸_彼岸壁纸.jpg')

// clipboardLib.ClipboardWriteHTML('<p>Hello from <span style="color: red;">Node.js</span></p>')

// const rawData = Buffer.from('Hello from Node.js');
// clipboardLib.ClipboardWriteRAWD(rawData, rawData.length);

// ffi 有 bug
// https://github.com/nodejs/node/issues/32463
// https://github.com/node-ffi-napi/node-ffi-napi/issues/71

const readText = () => {
    try {
        const resultPtr = clipboardLib.ClipboardReadText()
        const text = ref.readCString(resultPtr)
        // 释放内存
        clipboardLib.FreeCharMem(resultPtr)

        return text
    } catch (e) {
        console.log(e)
    }
}
// console.log(555.111, readText())
// try {
//     const resultPtr = clipboardLib.ClipboardReadText()
//     console.log(666.11, ref.readCString(resultPtr))
//     // 释放内存
//     clipboardLib.FreeCharMem(resultPtr);
// } catch (e) {
//     console.log(666.111, e)
// }
//
const readHTML = () => {
    try {
        const resultPtr = clipboardLib.ClipboardReadHTML()
        const html = ref.readCString(resultPtr)
        // 释放内存
        clipboardLib.FreeCharMem(resultPtr)

        return html
    } catch (e) {
        console.log(e)
    }
}
// console.log(555.112, readHTML())
// try {
//     const resultPtr2 = clipboardLib.ClipboardReadHTML()
//     console.log(666.12, ref.readCString(resultPtr2))
//     // 释放内存
//     clipboardLib.FreeCharMem(resultPtr2);
// } catch (e) {
//     console.log(666.121, e)
// }
// // const resultPtr2 = clipboardLib.ClipboardReadHTML()
// // console.log(666.12, ref.readCString(resultPtr2))
// // // 释放内存
// // clipboardLib.FreeCharMem(resultPtr2);


const readPaths = () => {
    try {
        const resultPtr = clipboardLib.ClipboardReadPaths()
        const paths = ref.readCString(resultPtr)
        // 释放内存
        clipboardLib.FreeCharMem(resultPtr)

        return paths
    } catch (e) {
        console.log(e)
    }
}
// try {
//     const resultPtr3 = clipboardLib.ClipboardReadPaths()
//     console.log(666.13, ref.readCString(resultPtr3))
// // 释放内存
//     clipboardLib.FreeCharMem(resultPtr3);
// } catch (e) {
//     console.log(666.131, e)
// }
//
//
// // {
// //     // 调用 Go 函数并接收返回值
// //     const sizeBuffer = Buffer.alloc(ref.types.size_t.size);
// //     const resultPtr = mylib.LoadImageBytes(sizeBuffer);
// //     const size = ref.readUInt64(sizeBuffer, 0);
// //
// //     // 将返回的内存指针转换为 Buffer
// //     const imageBuffer = Buffer.from(ref.reinterpret(resultPtr, size));
// //
// //     // 保存为文件，例如保存为 example_output.jpg
// //     fs.writeFileSync('./example_output.png', imageBuffer);
// //
// //     // 释放内存
// //     mylib.FreeCharMem(resultPtr);
// //
// //     console.log(imageBuffer)
// // }
//
//

const readImage = () => {
    try {
        const dataPtrPtr = ref.alloc(charPtr)
        const lengthPtr = ref.alloc(ref.types.int)

        // 调用 C 函数获取数据
        clipboardLib.ClipboardReadImage(dataPtrPtr, lengthPtr)
        const buf = Buffer.from(ref.reinterpret(dataPtrPtr.deref(), lengthPtr.deref()))

        // 释放 C 中的内存
        clipboardLib.FreeCharMem(dataPtrPtr.deref())

        return buf
    } catch (e) {
        console.log(e)
    }
}

const readRAWD = () => {
    try {
        const dataPtrPtr = ref.alloc(charPtr)
        const lengthPtr = ref.alloc(ref.types.int)

        // 调用 C 函数获取数据
        clipboardLib.ClipboardReadRAWD(dataPtrPtr, lengthPtr)
        const buf = Buffer.from(ref.reinterpret(dataPtrPtr.deref(), lengthPtr.deref()))

        // 释放 C 中的内存
        clipboardLib.FreeCharMem(dataPtrPtr.deref())

        return buf
    } catch (e) {
        console.log(e)
    }
}
// console.log(555.113, readRAWD())
//
// return

// // 读取原始数据
// readClipboardData()
// function readClipboardData() {
//     const dataPtrPtr = ref.alloc(charPtr);
//     const lengthPtr = ref.alloc(ref.types.int);
//
//     // 调用 C 函数获取数据
//     clipboardLib.ClipboardReadRAWD(dataPtrPtr, lengthPtr);
//
//     // let result = dataPtr.deref().readCString();
//     // console.log('Data:', result);
//     // console.log('Length:', lengthPtr.deref());
//     console.log(666.14)
//     console.log('Length:', lengthPtr.deref());
//
//     const result2 = Buffer.from(ref.reinterpret(dataPtrPtr.deref(), lengthPtr.deref()));
//     console.log('Data2:', result2.toString());
//
//     // chatgpt 给了这个，又说避免使用
//     // let dataPtr = dataPtrPtr.deref();
//     // let dataLength = lengthPtr.deref();
//     // let buffer = Buffer.from(dataPtr.readPointer(0, dataLength));
//     // // 打印原始字节数据
//     // console.log('Data:', buffer.toString());
//     // console.log('Length:', dataLength);
//
//
//     // // 打印结果
//     // console.log("Data from C:", data.toString('utf8', 0, length));
//     // console.log("Length:", length);
//
//     // 释放 C 中的内存
//     clipboardLib.FreeCharMem(dataPtrPtr.deref());
// }

// let i = 0
// setInterval(function () {
//     i++
//     console.log(777.333)
//
//     if (i > 5) {
//         process.exit();
//     }
// }, 900)
//
// clipboardReadImage()
// function clipboardReadImage() {
//     const dataPtrPtr = ref.alloc(charPtr);
//     const lengthPtr = ref.alloc(ref.types.int);
//
//     // 调用 C 函数获取数据
//     clipboardLib.ClipboardReadImage(dataPtrPtr, lengthPtr);
//
//     const imageBuffer = Buffer.from(ref.reinterpret(dataPtrPtr.deref(), lengthPtr.deref()));
//
//     console.log(666.15, imageBuffer.length)
//
//     // 保存为文件，例如保存为 example_output.jpg
//     if (imageBuffer.length > 0) {
//         fs.writeFileSync('./example_output.png', imageBuffer);
//     }
//
//     // 释放 C 中的内存
//     clipboardLib.FreeCharMem(dataPtrPtr.deref());
// }

module.exports = {
    getSequenceNumber: () => {
        // 在 linux 中每次进程重启会从零重新计数
        // 此方法同于监控剪贴板变化的，当两次 sn 不同时可以认为被修改了
        return clipboardLib.ClipboardSequenceNumber()
    },

    readText,
    readHTML,
    readPaths,
    readImage,
    readRAWD,

    writeMany,
    writeText,
    writeHTML,
    writePaths,
    writeImage,
    writeRAWD,
}
