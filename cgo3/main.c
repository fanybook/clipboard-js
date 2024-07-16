#include <stdio.h>
#include <stdlib.h>
#include "libclipboard.h"

//// 声明 Go 导出的函数
//void GoHello();

int main() {
    // 调用 Go 函数
    char* textStr = clipboard_read_text();
    // 打印结果
    printf("clipboard_read_text result: %s\n", textStr);
    // 释放 Go 分配的内存
    free(textStr);

    // 调用 Go 函数
    char* htmlStr = clipboard_read_html();
    // 打印结果
    printf("clipboard_read_html result: %s\n", htmlStr);
    // 释放 Go 分配的内存
    free(htmlStr);

    // 调用 Go 函数
    char* data;
    int length;
    clipboard_read_rawd(&data, &length);
    // 打印结果（打印结尾有乱码，应该是按照字符串多读了一位）
    printf("clipboard_read_rawd result length: %d\n", length);
    // 打印字节数组内容
    printf("clipboard_read_rawd result: ");
    for (int i = 0; i < length; i++) {
        printf("%c", data[i]);
    }
    printf("\n");
    // 释放 Go 分配的内存
    free(data);

    // 调用 Go 函数
    char* pathsStr = clipboard_read_paths();
    // 打印结果
    printf("clipboard_read_paths result: %s\n", pathsStr);
    // 释放 Go 分配的内存
    free(pathsStr);

    return 0;
}
