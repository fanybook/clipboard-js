#include <stdio.h>
#include "libgohello.h"

//// 声明 Go 导出的函数
//void GoHello();

int main() {
    hello();      // 调用 C 函数
    GoHello();    // 调用 Go 函数
    return 0;
}
