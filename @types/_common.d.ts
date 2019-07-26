/// <reference types="@fibjs/types" />

/// <reference path="jsonrpc.d.ts" />

declare namespace FibRpc {
    type FibRpcInvokeId = FibRpcJsonRpcSpec.JsonRpcId;

    type JsonRpcSpreadArguments = (
        FibRpcJsonRpcSpec.Primitive | FibRpcJsonRpcSpec.AnyObject
    )[]

    interface FibRpcError<TErrData = any> {
        code: number
        message: string
        data?: TErrData
    }

    class RpcErrorClass<TErrData = any> extends Error implements FibRpcError<TErrData> {
        constructor (input:
            keyof FibRpcJsonRpcSpec.PredefinedCodeMessages
            | keyof FibRpcJsonRpcSpec.FibRpcPredefinedCodeMessages
            | FibRpcError<TErrData>
        );
        
        code: FibRpc.FibRpcError<TErrData>['code']
        data?: TErrData
    }

    interface rpcError {
        (
            code: FibRpc.FibRpcError['code'] | string,
            message?: FibRpc.FibRpcError['message'],
            data?: FibRpc.FibRpcError['data'],
        ): FibRpc.RpcErrorClass
    }
}