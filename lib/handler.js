var util = require("util");

function set_error(id, code, message) {
    return {
        id: id,
        error: {
            code: code,
            message: message
        }
    };
}

function handler(func) {
    function invoke(m) {
        var o;
        try {
            o = m.json();
        } catch (e) {
            return set_error(-1, -32700, "Parse error.");
        }

        var method = o.method;

        if (!method)
            return set_error(o.id, -32600, "Invalid Request.");

        var params = o.params;

        if (params === undefined)
            params = [];

        if (!Array.isArray(params))
            return set_error(o.id, -32602, "Invalid params.");

        var f;
        if (!util.isFunction(func)) {
            f = func[method];
            if (!f)
                return set_error(o.id, -32601, "Method not found.");
        } else
            f = func;

        var r;
        try {
            r = f.apply(m, params);
        } catch (e) {
            console.error(e.stack);
            return set_error(o.id, -32603, "Internal error.");
        }

        return {
            id: o.id,
            result: r
        };
    }

    function _hdr(m) {
        if ('onmessage' in m) {
            m.onmessage = function (m) {
                this.send(JSON.stringify(invoke(m)));
            };
        } else
            m.response.json(invoke(m));
    };

    return _hdr;
}

module.exports = handler;