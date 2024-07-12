#include <stdlib.h>
#include <stdint.h>
#include "callback.h"

// 用于存储回调函数指针
Callback globalCallback;

// 用于注册回调函数
void registerCallback(Callback cb) {
    globalCallback = cb;
}

// 用于调用回调函数
void triggerCallback(int value) {
    if (globalCallback != NULL) {
        globalCallback(value);
    }
}
