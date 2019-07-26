/// <reference path="_common.d.ts" />
/// <reference path="_callee.d.ts" />

declare namespace FibRpcInvoke {
    interface JsonRpcInvokedFunction {
        (...params: FibRpc.JsonRpcSpreadArguments): any
    }

    type FibRpcFnHash = {
        [fnName: string]: JsonRpcInvokedFunction
    }

    type FibRpcInvokeArg = FibRpcCallee.HttpCallee | FibRpcInvokeWsSocketMessage
    type FibRpcHandlerFunctions = JsonRpcInvokedFunction | FibRpcFnHash

    interface FibRpcInvokeInternalFunction {
        (m: FibRpcInvokeArg): FibRpcJsonRpcSpec.JsonRpcResponsePayload
    }

    interface FibRpcInvokeWsSocketMessage extends Class_WebSocketMessage {
    }

    interface FibRpcInvokeClient {
        [method_name: string]: Function
    }
}