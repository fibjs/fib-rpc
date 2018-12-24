/// <reference types="fibjs" />

/// <reference path="jsonrpc.d.ts" />

declare namespace FibRpc {
    type FibRpcInvokeId = FibRpc_JSONRPC.JsonRpcId;
    type FibRpcErrCodeType = number;

    type JsonRpcRestStyleParamsType = (FibRpc_JSONRPC.JsonRpcPrimitive | FibRpc_JSONRPC.JsonRpcParamObjectType)[]

    interface FibRpcError {
        code: FibRpc.FibRpcErrCodeType
        message: string
    }

    type FibRpcResultData = any
}