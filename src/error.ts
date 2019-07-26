/// <reference path="../@types/index.d.ts" />

/**
 * @see https://www.jsonrpc.org/specification
 */
const SPEC_CODE_MESSAGES: FibRpcJsonRpcSpec.JsonRpcPredefinedCodeMessages = {
    '-32600': "Invalid Request.",
    '-32601': "Method not found.",
    '-32602': "Invalid params.",
    '-32603': "Internal error.",
    '-32700': "Parse error.",
}

const SERVER_CODE_MESSAGES: FibRpcJsonRpcSpec.FibRpcPredefinedCodeMessages = {
    '-32000': 'Server disconnected.',
}

const DEFAULT_SERVER_ERR = 'Server error.'

const CodeTypes = {
    're_for_future': 0,
    're_predefined': 1,
    're_server_implementation': 2,
    'custom': 3,
}

function filterCodeType (code: FibRpc.FibRpcError['code']) {
    let ctype = CodeTypes['custom']

    if (code >= -32768 && code <= -32000) {
        ctype = CodeTypes['re_for_future']
        if (SPEC_CODE_MESSAGES.hasOwnProperty(code))
            ctype = CodeTypes['re_predefined']
        else if (code >= -32099)
            ctype = CodeTypes['re_server_implementation_defined']
    } else
        ctype = CodeTypes['custom']

    return ctype
}

export class RpcError extends Error implements FibRpc.RpcErrorClass {
    code: FibRpc.RpcErrorClass['code']
    data?: FibRpc.RpcErrorClass['data']

    constructor (
        input: FibRpc.FibRpcError,
    ) {
        if (typeof input === 'string' || typeof input === 'number') {
            const args = Array.prototype.slice.call(arguments)
            input = {
                code: input,
                message: args[1],
                data: args[2]
            }
        }

        let {
            code = -32000,
            message = DEFAULT_SERVER_ERR,
            data
        } = input;

        code = parseInt(code as any, 10);

        switch (filterCodeType(code)) {
            case CodeTypes['re_for_future']:
                throw new Error(`[RpcError]never use reserved code for future`)
            case CodeTypes['re_predefined']:
                message = SPEC_CODE_MESSAGES[code]
                break
            case CodeTypes['re_server_implementation_defined']:
                message = SERVER_CODE_MESSAGES[code] || DEFAULT_SERVER_ERR
                break
            case CodeTypes['custom']:
                break
        }

        super(message)

        this.name = 'RpcError'
        this.code = code
        this.data = data
    }
}

export function setRpcError(
    id: FibRpc.FibRpcInvokeId,
    code: FibRpc.FibRpcError['code'],
    message: string = SPEC_CODE_MESSAGES[code] || SERVER_CODE_MESSAGES[code]
): FibRpcJsonRpcSpec.JsonRpcResponsePayload {
    return {
        id: id,
        error: {
            code: code,
            message: message
        }
    };
}