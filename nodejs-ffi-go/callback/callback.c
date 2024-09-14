#include <stdlib.h>

static void callJsCallback(JsCallback cb, char* val) {
    cb(val);
    free(val);
}
