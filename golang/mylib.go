//go:build darwin

package main

/*
#include "callback.h"
#cgo LDFLAGS: -L. -lcallback
*/
import "C"
import (
	"fmt"
	"os"
	"time"
	"unsafe"
)

//export Add
func Add(a, b int) int {
	return a + b
}

//export ProcessData
func ProcessData(data *C.char, length C.int) {
	bytes := C.GoBytes(unsafe.Pointer(data), length)
	fmt.Println("Received data:", string(bytes))
}

//export LoadImageBytes
func LoadImageBytes(size *C.size_t) *C.char {
	// 读取图片文件
	imagePath := "/Users/admin/Pictures/open.png"
	imageBytes, err := os.ReadFile(imagePath)
	if err != nil {
		fmt.Println("Error reading image file:", err)
		return nil
	}

	// fmt.Println(imageBytes)

	imageSize := len(imageBytes)
	*size = C.size_t(imageSize)

	// 分配C内存并复制图片数据
	ptr := C.malloc(*size)
	copy((*[1 << 30]byte)(ptr)[:imageSize], imageBytes)

	return (*C.char)(ptr)

	// // 将 []byte 转换为 C.char  C.CString(string(imageBytes))
	// return (*C.char)(C.CBytes(imageBytes))

	// TODO: 直接返回 golang 的指针，还是有点危险的，因为要用锁和全局变量，避免被 gc 处理掉
	// *size = C.size_t(len(imageBytes))
	// return (*C.char)(unsafe.Pointer(&imageBytes[0]))
}

//export FreeCharMem
func FreeCharMem(charMem *C.char) {
	C.free(unsafe.Pointer(charMem))
}

var callbackFunc func(int)

//export RegisterCallback
func RegisterCallback(cb C.Callback) {
	C.registerCallback(cb)
}

//export TriggerCallback
func TriggerCallback() {
	for i := 0; i < 5; i++ {
		time.Sleep(1 * time.Second)
		fmt.Println(i)
		C.triggerCallback(C.int(i))
	}
	// go func() {
	// 	for i := 0; i < 5; i++ {
	// 		time.Sleep(1 * time.Second)
	// 		fmt.Println(i)
	// 		C.triggerCallback(C.int(i))
	// 	}
	// }()
	// select {}
}

func main() {
}
