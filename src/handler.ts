/// <reference path="../@types/index.d.ts" />

import util = require("util");

import { setRpcError } from './error'

const handler: FibRpcHandlerModule.FibRpcHandlerGenerator = function (func: FibRpcInvoke.FibRpcInvokedFunctions, opts: FibRpcHandlerModule.HandlerOptions = {}) {
    const {allow_anytype_params = false} = opts || {}
    
    const invoke: FibRpcInvoke.FibRpcInvokeInternalFunction = function (m: FibRpcInvoke.FibRpcInvokeArg): FibRpcJsonRpcSpec.JsonRpcResponsePayload {
        var o: FibRpcJsonRpcSpec.JsonRpcRequestPayload;
        try {
            o = m.json();
        } catch (e) {
            return setRpcError(-1, -32700);
        }

        var method = o.method;

        if (!method)
            return setRpcError(o.id, -32600);

        var params = o.params;

        if (!allow_anytype_params) {
            if (params === undefined)
                params = [];

            if (!Array.isArray(params))
                return setRpcError(o.id, -32602);
        }

        var f: FibRpcInvoke.JsonRpcInvokedFunction;
        if (!util.isFunction(func)) {
            f = (func as FibRpcInvoke.FibRpcFnHash)[method];
            if (!f)
                return setRpcError(o.id, -32601);
        } else {
            f = (func as FibRpcInvoke.JsonRpcInvokedFunction);
        }

        var r: FibRpc.FibRpcResultData;
        try {
            r = f[allow_anytype_params ? 'call' : 'apply'](m, params);
        } catch (e) {
            console.error(e.stack);
            return setRpcError(o.id, -32603);
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
            (m as FibRpcCallee.FibRpcHttpCallee).response.json(
                invoke(m)
            );
        }
    };

    return _hdr;
}

export = handler;
