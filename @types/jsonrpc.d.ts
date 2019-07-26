/// <reference path="_common.d.ts" />

/**
 * @see https://www.jsonrpc.org/specification
 */
declare namespace FibRpcJsonRpcSpec {
    type JsonRpcId = number | string;

    interface JsonRpcPredefinedCodeMessages {
        '-32600': "Invalid Request.",
        '-32601': "Method not found.",
        '-32602': "Invalid params.",
        '-32603': "Internal error.",
        '-32700': "Parse error."
    }

    interface ServerPrefefinedCodeMessages {
        [k: string]: string
    }

    interface FibRpcPredefinedCodeMessages extends ServerPrefefinedCodeMessages {
        '-32000': 'Server disconnected.'        
    }

    type JsonRpcPrimitive = string | number | boolean | null
    interface AnyObject {
        [key: string]: any;
    }
    type JsonRpcParamArrayType = (
        JsonRpcPrimitive | AnyObject | Array<JsonRpcPrimitive | AnyObject>
    )[]

    interface JsonRpcPayloadBase {
        id: JsonRpcId
        jsonrpc?: "2.0" | string
    }

    interface JsonRpcRequestPayload extends JsonRpcPayloadBase {
        method?: string;
        params?: AnyObject | JsonRpcParamArrayType
    }

    type JsonRpcResponsePayload = ({
        error?: FibRpc.FibRpcError
        result?: FibRpc.FibRpcResultData
    } & JsonRpcPayloadBase)
}