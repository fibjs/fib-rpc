/// <reference path="_common.d.ts" />
/// <reference path="_invoke.d.ts" />
/// <reference path="handler.d.ts" />

declare namespace FibRpcCallor {
    interface httpCall {
        (
            js_remote: FibRpcHandlerModule.FibRpcHdlr,
            request_data: FibRpcJsonRpcSpec.RequestPayload | Class_HttpRequest
        ): Class_HttpResponse
    }
}