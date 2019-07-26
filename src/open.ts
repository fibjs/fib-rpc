import * as handler from "./handler";
import * as connect from "./connect";

export function open_handler (funcs: FibRpcInvoke.FibRpcHandlerFunctions, opts: FibRpcHandlerModule.HandlerOptions) {
    return handler(funcs, {...opts, allow_anytype_params: true})
}

export function open_connect (
    url: FibRpcConnectModule.FibRpcWsConnUrl,
    opts?: FibRpcConnectModule.ConnectOptions
): FibRpcInvoke.FibRpcInvokeClient {
    return connect(url, {...opts, open: true})
}