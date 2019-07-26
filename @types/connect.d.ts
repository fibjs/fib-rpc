/// <reference path="_common.d.ts" />
/// <reference path="_invoke.d.ts" />

declare namespace FibRpcConnectModule {
    type FibRpcWsConnUrl = string;

    interface FibRpcWsCoroutinePayload {
        e: Class_Event
        r?: FibRpcJsonRpcSpec.JsonRpcRequestPayload
        v?: FibRpcJsonRpcSpec.JsonRpcResponsePayload
    }
    interface FibRpcWsConnHash {
        /* connName is just FibRpcInvokeId */
        [connName: string]: FibRpcWsCoroutinePayload
    }

    interface FibRpcConnect {
        (url: FibRpcWsConnUrl, opts?: ConnectOptions): FibRpcInvoke.FibRpcInvokeClient
    }

    interface ConnectOptions {
        /**
         * whether connect remote json-rpc server which'is open,
         * see details `FibRpcHandlerModule.HandlerOptions.allow_anytype_params`
         */
        open?: boolean
    }
}