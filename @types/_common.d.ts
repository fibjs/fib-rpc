/// <reference types="@fibjs/types" />

/// <reference path="jsonrpc.d.ts" />

declare namespace FibRpc {
    type FibRpcInvokeId = FibRpcJsonRpcSpec.JsonRpcId;

    type JsonRpcSpreadArguments = (
        FibRpcJsonRpcSpec.JsonRpcPrimitive | FibRpcJsonRpcSpec.AnyObject
    )[]

    interface FibRpcError<TErrData = any> {
        code: number
        message: string
        data?: TErrData
    }

    class RpcErrorClass<TErrData = any> extends Error implements FibRpcError<TErrData> {
        constructor (input:
            keyof FibRpcJsonRpcSpec.JsonRpcPredefinedCodeMessages
            | keyof FibRpcJsonRpcSpec.FibRpcPredefinedCodeMessages
            | FibRpcError<TErrData>
        );
        
        code: FibRpc.FibRpcError<TErrData>['code']
        data?: TErrData
    }

    type FibRpcResultData = any
}