#ifndef CALLBACK_H
#define CALLBACK_H

#include <stdlib.h>
#include <stdint.h>

// 定义回调函数类型
typedef void (*Callback)(int);

// 用于注册回调函数
void registerCallback(Callback cb);

// 用于调用回调函数
void triggerCallback(int value);

#endif
