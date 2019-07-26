import http = require('http')

export function isWebsocket (m: FibRpcCallee.CalleeObject): m is FibRpcCallee.WsCallee {
    // 'onmessage' is in prototype of FibRpcCallee.WsCallee
    return 'onmessage' in m
}

export function isHttpRequest (m: FibRpcCallee.CalleeObject): m is FibRpcCallee.HttpCallee {
    return m instanceof http.Request
}