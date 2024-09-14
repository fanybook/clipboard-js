#ifndef CALLBACK_H
#define CALLBACK_H

typedef void (*JsCallback)(char*);

static void callJsCallback(JsCallback cb, char* val);

#endif
