package main

import "C"
import (
    "fmt"
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

func main() {}
