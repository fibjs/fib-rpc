/// <reference path="../@types/index.d.ts" />

import errCodeMsg = require('./err_code_msg')
import util = require("util");

function set_error(id: FibRpc.FibRpcInvokeId, code: FibRpc.FibRpcErrCodeType, message: string): FibRpc_JSONRPC.JsonRpcResponsePayload {
    return {
        id: id,
        error: {
            code: code,
            message: message
        }
    };
}

const handler: FibRpcHandlerModule.FibRpcHandlerGenerator = function (func: FibRpcInvoke.FibRpcInvokedFunctions, opts: FibRpcHandlerModule.HandlerOptions = {}) {
    const {allow_anytype_params = false} = opts || {}
    
    const invoke: FibRpcInvoke.FibRpcInvokeInternalFunction = function (m: FibRpcInvoke.FibRpcInvokeArg): FibRpc_JSONRPC.JsonRpcResponsePayload {
        var o: FibRpc_JSONRPC.JsonRpcRequestPayload;
        try {
            o = m.json();
        } catch (e) {
            return set_error(-1, -32700, errCodeMsg["32700"]);
        }

        var method = o.method;

        if (!method)
            return set_error(o.id, -32600, errCodeMsg["32600"]);

        var params = o.params;

        if (!allow_anytype_params) {
            if (params === undefined)
                params = [];

            if (!Array.isArray(params))
                return set_error(o.id, -32602, errCodeMsg["32602"]);
        }

        var f: FibRpcInvoke.JsonRpcInvokedFunction;
        if (!util.isFunction(func)) {
            f = (func as FibRpcInvoke.FibRpcFnHash)[method];
            if (!f)
                return set_error(o.id, -32601, errCodeMsg["32601"]);
        } else {
            f = (func as FibRpcInvoke.JsonRpcInvokedFunction);
        }

        var r: FibRpc.FibRpcResultData;
        try {
            r = f[allow_anytype_params ? 'call' : 'apply'](m, params);
        } catch (e) {
            console.error(e.stack);
            return set_error(o.id, -32603, errCodeMsg["32603"]);
        }

        return {
            id: o.id,
            result: r
        };
    }

    const _hdr: FibRpcHandlerModule.FibRpcHdlr = function (m: FibRpcCallee.FibRpcCalleeObject) {
        if ('onmessage' in m) {
            (m as FibRpcCallee.FibRpcWsCallee).onmessage = function (msg: FibRpcInvoke.FibRpcInvokeWsSocketMessage) {
                this.send(JSON.stringify(invoke(msg)));
            };
        } else {
            (m as FibRpcCallee.FibRpcHttpCallee).response.json(invoke(m));
        }
    };

    return _hdr;
}

export = handler;
