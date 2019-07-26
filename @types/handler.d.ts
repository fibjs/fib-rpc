/// <reference path="_common.d.ts" />
/// <reference path="_invoke.d.ts" />

declare namespace FibRpcHandlerModule {
    interface FibRpcHdlr {
        (m: FibRpcCallee.CalleeObject): void;
    }

    interface FibRpcHandlerGenerator {
        (fn: FibRpcInvoke.FibRpcHandlerFunctions, opts?: HandlerOptions): FibRpcHdlr
    }

    /* @deprecated */
    type FibRpcGenerator = FibRpcHandlerGenerator

    interface HandlerOptions {
        /**
         * @default false
         */
        allow_anytype_params?: boolean
        /**
         * @default true
         */
        log_error_stack?: boolean
        /**
         * @default {}
         */
        server_error_messages?: FibRpcJsonRpcSpec.ServerPrefefinedCodeMessages
    }
}