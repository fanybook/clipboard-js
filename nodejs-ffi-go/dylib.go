// go build -o storage_kit.dylib -buildmode=c-shared -ldflags="-s -w" dylib.go
// go build -o storage_kit.so -buildmode=c-shared -ldflags="-s -w" dylib.go
// go build -o storage_kit.dll -buildmode=c-shared -ldflags="-s -w" dylib.go

package main

/*
#cgo CFLAGS: -std=c99

#include <stdlib.h>

typedef void (*JsCallback)(char*);
static void callJsCallback(JsCallback cb, char* val) {
    cb(val);
    free(val);
}
*/
import "C"
import (
	"fmt"
	"runtime"
	"time"
	"unsafe"
)

var externalPath string

// AsyncCall 异步的调用
//
//export AsyncCall
func AsyncCall(actPtr *C.char, jsonDataPtr *C.char, cb C.JsCallback) {
	go func() {
		defer func() {
			if r := recover(); r != nil {
				fmt.Println("fiber thread panic:", r)
			}
		}()

		runtime.LockOSThread()
		defer runtime.UnlockOSThread()

		// yzx: 1. 不能使用外部变量，因为外部的会被回收
		act := C.GoString(actPtr)
		jsonDataStr := C.GoString(jsonDataPtr)

		for i := 0; i < 10; i++ {
			time.Sleep(1 * time.Second)
			fmt.Println("from golang", i, act, jsonDataStr)
			//
			// C.callWatchCallback(C.int(i))

			if i > 3 {
				// C.callJsCallback(cb, C.CString("hello world!"))

				respPtr := C.CString(`{"code":0,"data":{"hello":"world"}}`)
				C.callJsCallback(cb, respPtr)
				break
			}
		}
	}()
}

//export FreeCharMem
func FreeCharMem(charPtr *C.char) {
	C.free(unsafe.Pointer(charPtr))
}

func main() {
}
