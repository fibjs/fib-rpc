import ws = require('ws')
import http = require('http')

export function isWebsocket (m: FibRpcCallee.CalleeObject): m is FibRpcCallee.WebSocketCallee {
    // 'onmessage' is in prototype of FibRpcCallee.WebSocketCallee
    return 'onmessage' in m
}

export function isHttpRequest (m: FibRpcCallee.CalleeObject): m is FibRpcCallee.HttpCallee {
    return m instanceof http.Request
}