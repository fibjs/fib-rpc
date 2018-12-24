/// <reference path="_invoke.d.ts" />

declare namespace FibRpcHandlerModule {
    interface FibRpcHdlr {
        (m: FibRpcCallee.FibRpcCalleeBase): void;
    }

    interface FibRpcHandlerGenerator {
        (fn: FibRpcInvoke.FibRpcInvokedFunctions): FibRpcHdlr
    }

    /* @deprecated */
    type FibRpcGenerator = FibRpcHandlerGenerator
}