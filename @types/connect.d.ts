/// <reference path="_common.d.ts" />
/// <reference path="_invoke.d.ts" />

declare namespace FibRpcConnectModule {
    type FibRpcWsConnUrl = string;

    interface FibRpcWsCoroutinePayload {
        e: Class_Event
        r?: FibRpcJsonRpcSpec.RequestPayload
        v?: FibRpcJsonRpcSpec.ResponsePayload
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
        /**
         * @default true
         */
        log_error_stack?: boolean
        /**
         * @description whether throw real Error object rather than message
         * @default false
         */
        throw_error?: boolean
    }
}