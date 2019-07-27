/// <reference path="../@types/index.d.ts" />

import http = require('http')

export const httpCall: FibRpcCallor.httpCall = (js_remote, r) => {
    let http_m = null
    if (r instanceof http.Request) {
        http_m = r
    } else {
        http_m = new http.Request();
        http_m.value = '';
        http_m.json(r);
    }

    js_remote(http_m);

    return http_m.response;
}