/// <reference path="_common.d.ts" />
/// <reference path="_invoke.d.ts" />

declare namespace FibRpcConnectModule {
    type FibRpcWsConnUrl = string;

    interface FibRpcWsConnHashInfo {
        e: Class_Event
        r?: FibRpc_JSONRPC.JsonRpcRequestPayload
        v?: FibRpc_JSONRPC.JsonRpcResponsePayload
    }
    interface FibRpcWsConnHash {
        /* connName is just FibRpcInvokeId */
        [connName: string]: FibRpcWsConnHashInfo
    }

    interface FibRpcConnect {
        (url: FibRpcWsConnUrl): FibRpcInvoke.FibRpcInvokeClient
    }
}