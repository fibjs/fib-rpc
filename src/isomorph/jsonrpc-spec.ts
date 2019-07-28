
/**
 * @see https://www.jsonrpc.org/specification
 */
const SPEC_CODE_MESSAGES: FibRpcJsonRpcSpec.PredefinedCodeMessages = {
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

export const CodeTypes = {
    're_for_future': 0,
    're_predefined': 1,
    're_server_implementation': 2,
    'custom': 3,
}

export function filterCodeType (code: FibRpc.FibRpcError['code']) {
    let ctype = CodeTypes['custom']

    if (code >= -32768 && code <= -32000) {
        ctype = CodeTypes['re_for_future']
        if (SPEC_CODE_MESSAGES.hasOwnProperty(code))
            ctype = CodeTypes['re_predefined']
        else if (code >= -32099)
            ctype = CodeTypes['re_server_implementation']
    } else
        ctype = CodeTypes['custom']

    return ctype
}

export function getMessageByCode (
    ctype: typeof CodeTypes[keyof typeof CodeTypes],
    code: FibRpc.FibRpcError['code'],
    fallback?: string
) {
    let message: string
    if (fallback !== undefined)
        message = fallback

    switch (ctype) {
        case CodeTypes['re_for_future']:
            break
        case CodeTypes['re_predefined']:
            message = SPEC_CODE_MESSAGES[code]
            break
        case CodeTypes['re_server_implementation']:
            message = SERVER_CODE_MESSAGES[code] || DEFAULT_SERVER_ERR
            break
        case CodeTypes['custom']:
            break
    }

    return message
}

export function mergeServerDefinedCodeMessages (
    provided: FibRpcJsonRpcSpec.ServerPrefefinedCodeMessages
) {
    return Object.assign({}, provided, SERVER_CODE_MESSAGES)
}