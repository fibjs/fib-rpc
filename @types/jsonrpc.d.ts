declare namespace FibRpc_JSONRPC {
    type JsonRpcId = number | string;

    interface JsonRpcCodeMessage {
        32000: 'Server disconnected.',
        32600: "Invalid Request.",
        32601: "Method not found.",
        32602: "Invalid params.",
        32603: "Internal error.",
        32700: "Parse error."
    }

    type JsonRpcCodes = keyof JsonRpcCodeMessage

    type JsonRpcPrimitive = string | number | boolean | null
    interface JsonRpcParamObjectType {
        [key: string]: any;
    }
    type JsonRpcParamArrayType = (JsonRpcPrimitive | JsonRpcParamObjectType | Array<JsonRpcPrimitive | JsonRpcParamObjectType>)[]
    type JsonRpcParamsType = JsonRpcParamObjectType | JsonRpcParamArrayType

    interface JsonRpcCommonPayload {
        id: JsonRpcId
        // allow it empty
        jsonrpc?: "2.0" | string
    }

    interface JsonRpcRequestPayload extends JsonRpcCommonPayload {
        method?: string;
        params?: JsonRpcParamsType
    }

    interface JsonRpcResponsePayload extends JsonRpcCommonPayload {
        error?: FibRpc.FibRpcError
        result?: FibRpc.FibRpcResultData
    }
}