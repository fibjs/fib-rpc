/// <reference path="../@types/index.d.ts" />

import util = require("util");

import { RpcError } from './error'
import { setRpcError } from "./utils/response";
import { mergeServerDefinedCodeMessages } from "./utils/jsonrpc-spec";
import { isWebsocket, isHttpRequest } from "./utils/callee";

const handler: FibRpcHandlerModule.FibRpcHandlerGenerator = function (
    func: FibRpcInvoke.FibRpcHandlerFunctions,
    opts: FibRpcHandlerModule.HandlerOptions = {}
) {
    const {
        allow_anytype_params = false,
        log_error_stack = true,
    } = opts || {}

    let {
        server_error_messages = {}
    } = opts || {}

    server_error_messages = mergeServerDefinedCodeMessages(server_error_messages)
    
    const invoke: FibRpcInvoke.FibRpcInvokeInternalFunction = function (
        m: FibRpcInvoke.FibRpcInvokeArg
    ): FibRpcJsonRpcSpec.JsonRpcResponsePayload {
        let o: FibRpcJsonRpcSpec.JsonRpcRequestPayload;
        try {
            o = m.json();
        } catch (e) {
            return setRpcError(-1, -32700);
        }

        const method = o.method;

        if (!method)
            return setRpcError(o.id, -32600);

        let params = o.params;

        if (!allow_anytype_params) {
            if (params === undefined)
                params = [];

            if (!Array.isArray(params))
                return setRpcError(o.id, -32602);
        }

        let f: FibRpcInvoke.JsonRpcInvokedFunction;
        if (!util.isFunction(func)) {
            f = (func as FibRpcInvoke.FibRpcFnHash)[method];
            if (!f)
                return setRpcError(o.id, -32601);
        } else {
            f = (func as FibRpcInvoke.JsonRpcInvokedFunction);
        }

        let r: FibRpc.FibRpcResultData;
        try {
            r = f[allow_anytype_params ? 'call' : 'apply'](m, params);
        } catch (e) {
            if (log_error_stack)
                console.error(e.stack);

            if (e instanceof RpcError)
                return setRpcError(
                    o.id,
                    e.code,
                    e.message || server_error_messages[e.code],
                    e.data
                )
                
            return setRpcError(o.id, -32603);
        }

        return {
            id: o.id,
            result: r
        };
    }

    const _hdr: FibRpcHandlerModule.FibRpcHdlr = function (m: FibRpcCallee.CalleeObject) {
        if (isWebsocket(m))
            m.onmessage = function (
                this: typeof m,
                msg: FibRpcInvoke.FibRpcInvokeWsSocketMessage
            ) {
                this.send(JSON.stringify(invoke(msg)));
            }
        else if (isHttpRequest(m))
            m.response.json(invoke(m));
        else
            throw new Error('invalid callee object passed!')
    };

    return _hdr;
}

export = handler;
