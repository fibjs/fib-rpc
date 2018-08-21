import { FibRpcWsSocketMessage, FibRpcCallee, FibRpcInvokeId, FibRpcCode, FibRpcInvokedResult, FibRpcFnHash, FibRpcFnPayload, FibRpcWsCallee, FibRpcHttpCallee, FibRpcInvokePayload, FibRpcInvokeArg, FibRpcHdlr, FibRpcInvoke, FibRpcHandler, JsonRpcInvokedFunction } from "../@types";

import errCodeMsg = require('./err_code_msg')
const util = require("util");

function set_error(id: FibRpcInvokeId, code: FibRpcCode, message: string): FibRpcInvokedResult {
    return {
        id: id,
        error: {
            code: code,
            message: message
        }
    };
}

const handler: FibRpcHandler = function (func: FibRpcFnPayload) {
    const invoke: FibRpcInvoke = function (m: FibRpcInvokeArg): FibRpcInvokedResult {
        var o: FibRpcInvokePayload;
        try {
            o = m.json();
        } catch (e) {
            return set_error(-1, -32700, errCodeMsg["32700"]);
        }

        var method = o.method;

        if (!method)
            return set_error(o.id, -32600, errCodeMsg["32600"]);

        var params = o.params;

        if (params === undefined)
            params = [];

        if (!Array.isArray(params))
            return set_error(o.id, -32602, errCodeMsg["32602"]);

        var f: JsonRpcInvokedFunction;
        if (!util.isFunction(func)) {
            f = (func as FibRpcFnHash)[method];
            if (!f)
                return set_error(o.id, -32601, errCodeMsg["32601"]);
        } else {
            f = (func as JsonRpcInvokedFunction);
        }

        var r;
        try {
            r = f.apply(m, params);
        } catch (e) {
            console.error(e.stack);
            return set_error(o.id, -32603, errCodeMsg["32603"]);
        }

        return {
            id: o.id,
            result: r
        };
    }

    const _hdr: FibRpcHdlr = function (m: FibRpcCallee) {
        if ('onmessage' in m) {
            (m as FibRpcWsCallee).onmessage = function (msg: FibRpcWsSocketMessage) {
                this.send(JSON.stringify(invoke(msg)));
            };
        } else {
            (m as FibRpcHttpCallee).response.json(invoke(m));
        }
    };

    return _hdr;
}

export = handler;
