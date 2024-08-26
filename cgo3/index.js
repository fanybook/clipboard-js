const clipboard = require('./index2.js')

// node v16.x 会有偶发致命错误，错误来自于 ffi-napi
// node v18.x 貌似没有问题了

// clipboard.writeText('你好棒')
// console.log('CT_TEXT:', clipboard.readText())
//
// clipboard.writeHTML('<p>世界</p>')
// console.log('CT_HTML:', clipboard.readHTML())
//
// // 写入后就可以粘贴了
// clipboard.writePaths('/Users/admin/Pictures/003235-171069315532ac.jpeg;/Users/admin/Pictures/报纸墙 长卷发 大波浪 可爱动漫美女壁纸_彼岸壁纸.jpg')
// console.log('CT_PATHS:', clipboard.readPaths())
//
// clipboard.writeRAWD(Buffer.from('hello rawd666!'))
// console.log('CT_RAWD:', clipboard.readRAWD().toString())
//
// clipboard.writeMany({
//   text: '你好1',
//   html: '<p>世界1</p>',
//   rawd: Buffer.from('hello rawd666!'),
// })
//
// console.log('CT_TEXT:', clipboard.readText())
// console.log('CT_HTML:', clipboard.readHTML())
// console.log('CT_RAWD:', clipboard.readRAWD().toString())


const fs = require('node:fs')
const path = require('node:path')
const imagePath = path.join(__dirname, 'example_output.png')
// // 读取图片文件并转换为 Buffer
// fs.readFile(imagePath, (err, data) => {
//     if (err) {
//         console.error('Error reading file:', err)
//         return
//     }q
//     clipboard.writeImage(data)
// })
const data = fs.readFileSync(imagePath)
clipboard.writeImage(data)

// TODO: 有问题，保存的图片打不开（后来试又好了）
const imageBuffer = clipboard.readImage()
fs.writeFileSync('./example_output2.png', imageBuffer)

console.log(666.111, clipboard.getSequenceNumber())
