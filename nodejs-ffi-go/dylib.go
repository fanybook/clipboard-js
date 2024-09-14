// go build -o storage_kit.dylib -buildmode=c-shared -ldflags="-s -w" dylib.go
// go build -o storage_kit.so -buildmode=c-shared -ldflags="-s -w" dylib.go
// go build -o storage_kit.dll -buildmode=c-shared -ldflags="-s -w" dylib.go

package main

/*
#cgo CFLAGS: -I./callback -std=c99
#cgo LDFLAGS: -ldl

// // macos 的编译器可能有问题，可能是有缓存
// // 同样的代码，修改打印字符串 fmt.Println("fiber thread panic:", r) 竟然会导致出现 fmt.Println("fiber thread panic:", r)
// #include <stdlib.h>
// #include "callback/callback.h"
// #include "callback/callback.c"

#include <stdlib.h>

typedef void (*JsCallback)(char*);

// 编译动态库，就必须加 static，否则 macos 会报 duplicate symbol
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
