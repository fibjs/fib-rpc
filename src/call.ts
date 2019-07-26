import ws = require('ws')
import http = require('http')

export const httpCall: FibRpcCallor.httpCall = (js_remote, r) => {
    const http_m = new http.Request();

    http_m.value = '';
    http_m.json(r);

    js_remote(http_m);

    http_m.response.body.rewind();
    return http_m.response;
}