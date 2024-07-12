#include <stdio.h>
//#include <stdlib.h>
//#include <stdint.h>
#include "hello.h"

void hello() {
    printf("Hello from C!\n");
}

//// 用于存储回调函数指针
//Callback globalCallback;
//
//// 用于注册回调函数
//void registerCallback2(Callback cb) {
//    globalCallback = cb;
//}
//
//// 用于调用回调函数
//void triggerCallback2(int value) {
//    if (globalCallback != NULL) {
//        globalCallback(value);
//    }
//}
