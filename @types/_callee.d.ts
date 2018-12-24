/// <reference types="fibjs" />

/// <reference path="_invoke.d.ts" />

declare namespace FibRpcCallee {
    interface FibRpcWsCallee extends Class_WebSocket, FibRpcCalleeBase {}

    interface FibRpcCalleeBase {
        id: FibRpc.FibRpcInvokeId;
    }
    interface FibRpcHttpCallee extends Class_HttpRequest, FibRpcCalleeBase {
        json(): FibRpc_JSONRPC.JsonRpcRequestPayload;
    }

    type FibRpcCalleeObject = FibRpcCallee.FibRpcHttpCallee | FibRpcCallee.FibRpcWsCallee
}