/// <reference path="../@types/index.d.ts" />

import util = require("util");

import { RpcError } from './error'
import { setRpcError } from "./isomorph/response";
import { mergeServerDefinedCodeMessages } from "./isomorph/jsonrpc-spec";
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
        server_error_messages = {},
        interceptor = undefined
    } = opts || {}

    const shouldSelect = typeof interceptor === 'function'

    server_error_messages = mergeServerDefinedCodeMessages(server_error_messages)
    
    const invoke: FibRpcInvoke.FibRpcInvokeInternalFunction = function (
        m: FibRpcInvoke.FibRpcInvokeArg
    ): FibRpcJsonRpcSpec.ResponsePayload {
        let o: FibRpcJsonRpcSpec.RequestPayload;
        try {
            o = m.json();
        } catch (e) {
            return setRpcError(-1, -32700);
        }

        let method = o.method;

        if (!method)
            return setRpcError(o.id, -32600);

        let params = o.params;

        if (!allow_anytype_params) {
            if (params === undefined)
                params = [];

            if (!Array.isArray(params))
                return setRpcError(o.id, -32602);
        }

        let selected;

        let f: FibRpcInvoke.JsonRpcInvokedFunction;
        if (typeof func !== 'function') {
            f = func[method];
            
            if (typeof f !== 'function' && (selected = shouldSelect && interceptor(o))) {
                switch (typeof selected) {
                    case 'string':
                        f = func[selected];
                        break
                    case 'function':
                        f = selected
                        break
                }
            }

            if (!f)
                return setRpcError(o.id, -32601);
        } else {
            f = func;
        }

        let r: any;
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
