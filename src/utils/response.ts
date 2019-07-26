import { getMessageByCode, filterCodeType } from "./jsonrpc-spec";

export function setRpcError(
    id: FibRpc.FibRpcInvokeId,
    code: FibRpc.FibRpcError['code'],
    message: string = getMessageByCode(filterCodeType(code), code),
    data?: FibRpc.FibRpcError['data']
): FibRpcJsonRpcSpec.ResponsePayload {
    return {
        id: id,
        error: { code, message, data }
    };
}