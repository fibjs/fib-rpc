/// <reference types="@fibjs/types" />

/// <reference path="_common.d.ts" />
/// <reference path="jsonrpc.d.ts" />
/// <reference path="handler.d.ts" />
/// <reference path="connect.d.ts" />
/// <reference path="call.d.ts" />

declare module "fib-rpc" {
    module FibRpcModule {
        export const handler: FibRpcHandlerModule.FibRpcHandlerGenerator
        export const open_handler: FibRpcHandlerModule.FibRpcHandlerGenerator
        export const connect: FibRpcConnectModule.FibRpcConnect
        export const open_connect: FibRpcConnectModule.FibRpcConnect

        export const rpcError: FibRpc.rpcError
        export const httpCall: FibRpcCallor.httpCall
    }

    export = FibRpcModule
}
