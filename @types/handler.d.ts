/// <reference path="_common.d.ts" />
/// <reference path="_invoke.d.ts" />

declare namespace FibRpcHandlerModule {
    interface FibRpcHdlr {
        (m: FibRpcCallee.FibRpcCalleeBase): void;
    }

    interface FibRpcHandlerGenerator {
        (fn: FibRpcInvoke.FibRpcInvokedFunctions, opts?: HandlerOptions): FibRpcHdlr
    }

    /* @deprecated */
    type FibRpcGenerator = FibRpcHandlerGenerator

    interface HandlerOptions {
        allow_anytype_params?: boolean
    }
}