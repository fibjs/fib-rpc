/// <reference types="@fibjs/types" />

/// <reference path="_common.d.ts" />
/// <reference path="_invoke.d.ts" />

declare namespace FibRpcCallee {
    interface FibRpcCalleeBase extends Fibjs.AnyObject {
        id: FibRpc.FibRpcInvokeId;
    }
    
    interface FibRpcWsCallee extends Class_WebSocket, FibRpcCalleeBase {}

    interface FibRpcHttpCallee extends Class_HttpRequest, FibRpcCalleeBase {
        json(): FibRpcJsonRpcSpec.JsonRpcRequestPayload;
    }

    type FibRpcCalleeObject = FibRpcCallee.FibRpcHttpCallee | FibRpcCallee.FibRpcWsCallee
}