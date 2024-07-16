// export SRCDIR=$(pwd) && go build -o libgohello.dylib -buildmode=c-shared main.go
// go build -o libgohello.dylib -buildmode=c-shared -ldflags "-X main.SRCDIR=$(pwd)" main.go

package main

/*
#include "hello.h"
// #cgo LDFLAGS: -L. -lhello
#cgo LDFLAGS: ${SRCDIR}/hello.o
*/
import "C"
import "fmt"

//export GoHello
func GoHello() {
	fmt.Println("Hello from Go GoHello()!")
	C.hello()
}

func main() {
	// 这里的方法，在共享库里根本不会运行
	fmt.Println("Hello from Go main()!")
	C.hello()
}
