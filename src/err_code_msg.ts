/// <reference path="../@types/index.d.ts" />

const codeMessages: FibRpc_JSONRPC.JsonRpcCodeMessage = {
    32000: 'Server disconnected.',
    32600: "Invalid Request.",
    32601: "Method not found.",
    32602: "Invalid params.",
    32603: "Internal error.",
    32700: "Parse error."
}

export = codeMessages