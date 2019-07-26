/// <reference types="@fibjs/types" />

/// <reference path="_common.d.ts" />
/// <reference path="_invoke.d.ts" />
/// <reference path="jsonrpc.d.ts" />

declare namespace FibRpcCallee {
    interface CalleeBase extends Fibjs.AnyObject {
        id?: FibRpc.FibRpcInvokeId;
    }
    
    interface WebSocketCallee extends Class_WebSocket, CalleeBase {}
    
    interface HttpCallee extends Class_HttpRequest, CalleeBase {}

    type CalleeObject = HttpCallee | WebSocketCallee
}