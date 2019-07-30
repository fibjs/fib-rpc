/// <reference path="../../@types/index.d.ts" />

import { filterCodeType, CodeTypes, getMessageByCode } from "./jsonrpc-spec";

/**
 * @notice once predefined errMsgs provided, message is determined by code absolutely.
 */
export class RpcError extends Error implements FibRpc.RpcErrorClass {
    code: FibRpc.RpcErrorClass['code']
    data?: FibRpc.RpcErrorClass['data']

    constructor (
        input: FibRpc.FibRpcError,
    ) {
        if (typeof input === 'string' || typeof input === 'number') {
            const args = Array.prototype.slice.call(arguments)
            input = { code: input, message: args[1], data: args[2] }
        }

        let { code = -32000, message, data } = input;

        code = parseInt(code as any, 10);

        const ctype = filterCodeType(code);
        if (ctype === CodeTypes['re_for_future'])
            throw new Error(`[RpcError]never use reserved code for future`)

        message = getMessageByCode(ctype, code, message);

        super(message)

        this.name = 'RpcError'
        this.code = code
        this.data = data
    }
}

export function rpcError<TErrData = any> (
    code: number | string,
    message?: string,
    data: TErrData = undefined
) {
    if (typeof code === 'string') code = parseInt(code)
    return new RpcError({ code, message, data })
}