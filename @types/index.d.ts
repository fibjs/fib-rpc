/// <reference types="@fibjs/types" />

/// <reference path="_common.d.ts" />
/// <reference path="jsonrpc.d.ts" />
/// <reference path="handler.d.ts" />
/// <reference path="connect.d.ts" />

declare module "fib-rpc" {
    module FibRpcModule {
        export const handler: FibRpcHandlerModule.FibRpcHandlerGenerator
        export const open_handler: FibRpcHandlerModule.FibRpcHandlerGenerator
        export const connect: FibRpcConnectModule.FibRpcConnect

        export function rpcError (
            code: FibRpc.FibRpcError['code'] | string,
            message?: FibRpc.FibRpcError['message'],
            data?: FibRpc.FibRpcError['data'],
        ): FibRpc.RpcErrorClass
    }

    export = FibRpcModule
}
