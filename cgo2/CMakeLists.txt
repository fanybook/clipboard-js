cmake_minimum_required(VERSION 3.12)
project(GoCExample)

# 设置 C 标准
set(CMAKE_C_STANDARD 99)

# 添加 C 源文件
add_library(hello STATIC hello.c)

# 设置 Go 源文件和生成目标
set(GO_SOURCES main.go)

# 编译 Go 代码
add_custom_command(
    OUTPUT libgohello.dylib
    COMMAND CGO_LDFLAGS="-L${CMAKE_BINARY_DIR}" go build -o ${CMAKE_BINARY_DIR}/libgohello.dylib -buildmode=c-shared ${CMAKE_SOURCE_DIR}/main.go
    DEPENDS ${GO_SOURCES} hello
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Building Go shared library"
)

# add_custom_target(gohello ALL DEPENDS libgohello.dylib) 的作用是创建一个自定义构建目标 gohello，并指定它依赖于 libgohello.dylib。这样做的主要目的是，如果你希望在构建时确保先生成 libgohello.dylib，然后执行一些额外的构建步骤或者测试，这个自定义目标会有所帮助。
# add_custom_target(gohello ALL DEPENDS libgohello.dylib)

# 设置安装目标
install(TARGETS hello ARCHIVE DESTINATION lib)
install(FILES ${CMAKE_BINARY_DIR}/libgohello.dylib DESTINATION lib)
