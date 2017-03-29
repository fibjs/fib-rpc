var util = require("util");

function set_error(m, id, code, message) {
    if ('addHeader' in m)
        m.response.addHeader("Content-Type", "application/json");

    m.response.write(JSON.stringify({
        id: id,
        error: {
            code: code,
            message: message
        }
    }));
}

function handler(func) {
    function invoke(m, o) {
        var method = o.method;

        if (!method)
            return {
                id: o.id,
                error: {
                    code: -32600,
                    message: "Invalid Request."
                }
            };

        var params = o.params;

        if (params === undefined)
            params = [];

        if (!Array.isArray(params))
            return {
                id: o.id,
                error: {
                    code: -32602,
                    message: "Invalid params."
                }
            };

        var f;
        if (!util.isFunction(func)) {
            f = func[method];
            if (!f)
                return {
                    id: o.id,
                    error: {
                        code: -32601,
                        message: "Method not found."
                    }
                };
        } else
            f = func;

        var r;
        try {
            r = f.apply(m, params);
        } catch (e) {
            console.error(e.stack);
            return {
                id: o.id,
                error: {
                    code: -32603,
                    message: "Internal error."
                }
            };
        }

        return {
            id: o.id,
            result: r
        };
    }

    function _hdr(m) {
        if ('onmessage' in m) {
            m.onmessage = function(m) {
                _hdr(m);
                this.send(m.response.data);
            };
            return;
        }

        if ('firstHeader' in m) {
            var ct = m.firstHeader("Content-Type");
            if (!ct)
                return set_error(m, -1, -32600, "Content-Type is missing.");

            ct = ct.split(",")[0];
            if (ct !== "application/json")
                return set_error(m, -1, -32600, "Invalid Content-Type.");
        }

        var d = m.data;

        if (Buffer.isBuffer(d))
            d = d.toString();

        if (!d)
            return set_error(m, -1, -32700, "Parse error.");

        var o;
        try {
            o = JSON.parse(d);
        } catch (e) {
            return set_error(m, -1, -32700, "Parse error.");

        }
        var r = invoke(m, o);

        if ('addHeader' in m)
            m.response.addHeader("Content-Type", "application/json");

        m.response.write(JSON.stringify(r));
    };

    return _hdr;
}

module.exports = handler;
