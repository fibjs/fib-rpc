import * as handler from "./handler";

export = function (funcs: FibRpcInvoke.FibRpcInvokedFunctions, opts: FibRpcHandlerModule.HandlerOptions) {
    return handler(funcs, {...opts, allow_anytype_params: true})
}