/// <reference path="_common.d.ts" />

/**
 * @see https://www.jsonrpc.org/specification
 */
declare namespace FibRpcJsonRpcSpec {
    type JsonRpcId = number | string;

    interface PredefinedCodeMessages {
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

    type Primitive = string | number | boolean | null
    interface AnyObject {
        [key: string]: any;
    }
    type ParamArrayType = (
        Primitive | AnyObject | Array<Primitive | AnyObject>
    )[]

    interface PayloadBase {
        id: JsonRpcId
        jsonrpc?: "2.0" | string
    }

    interface RequestPayload extends PayloadBase {
        method?: string;
        params?: AnyObject | ParamArrayType
    }

    type ResponsePayload<TRESULT = any, TErrData = any> = ({
        error?: FibRpc.FibRpcError<TErrData>
        result?: TRESULT
    } & PayloadBase)
}