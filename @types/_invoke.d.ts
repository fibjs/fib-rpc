/// <reference path="_common.d.ts" />
/// <reference path="_callee.d.ts" />

declare namespace FibRpcInvoke {
    interface JsonRpcInvokedFunction {
        (...params: FibRpc.JsonRpcSpreadArguments): any
    }

    type FibRpcFnHash = {
        [fnName: string]: JsonRpcInvokedFunction
    }

    type FibRpcInvokeArg = FibRpcCallee.FibRpcHttpCallee | FibRpcInvokeWsSocketMessage
    type FibRpcInvokedFunctions = JsonRpcInvokedFunction | FibRpcFnHash

    interface FibRpcInvokeInternalFunction {
        (m: FibRpcInvokeArg): FibRpcJsonRpcSpec.JsonRpcResponsePayload
    }

    interface FibRpcInvokeWsSocketMessage extends Class_WebSocketMessage {
        json(): FibRpcJsonRpcSpec.JsonRpcRequestPayload
    }

    interface FibRpcInvokeClient {
        [method_name: string]: Function
    }
}