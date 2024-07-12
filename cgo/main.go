package main

/*
#include "hello.c"
*/
import "C"

// //export RegisterCallback
// func RegisterCallback(cb C.Callback) {
// 	C.registerCallback3(cb)
// }
//
// //export TriggerCallback
// func TriggerCallback() {
// 	go func() {
// 		for i := 0; i < 5; i++ {
// 			time.Sleep(1 * time.Second)
// 			C.triggerCallback3(C.int(i))
// 		}
// 	}()
// }

//export Hello
func Hello() {
	C.hello()
}

func main() {
	C.hello()
}
