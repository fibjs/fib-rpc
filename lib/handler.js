"use strict";
const errCodeMsg = require("./err_code_msg");
const util = require("util");
function set_error(id, code, message) {
    return {
        id: id,
        error: {
            code: code,
            message: message
        }
    };
}
const handler = function (func) {
    const invoke = function (m) {
        var o;
        try {
            o = m.json();
        }
        catch (e) {
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
        var f;
        if (!util.isFunction(func)) {
            f = func[method];
            if (!f)
                return set_error(o.id, -32601, errCodeMsg["32601"]);
        }
        else {
            f = func;
        }
        var r;
        try {
            r = f.apply(m, params);
        }
        catch (e) {
            console.error(e.stack);
            return set_error(o.id, -32603, errCodeMsg["32603"]);
        }
        return {
            id: o.id,
            result: r
        };
    };
    const _hdr = function (m) {
        if ('onmessage' in m) {
            m.onmessage = function (msg) {
                this.send(JSON.stringify(invoke(msg)));
            };
        }
        else {
            m.response.json(invoke(m));
        }
    };
    return _hdr;
};
module.exports = handler;
