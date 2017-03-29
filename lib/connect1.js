var ws = require("ws");
var coroutine = require("coroutine");

var slice = Array.prototype.slice;

module.exports = function(url) {
    var sock;
    var id = 0;

    var sq = {};
    var sq_cnt = 0;

    var rq = {};
    var rq_cnt = 0;

    function reconnect() {
        sock = new ws.Socket(url);
        sock.onclose = () => {
            if (rq_cnt) {
                for (var r in rq) {
                    var o = rq[r];
                    o.v = {
                        id: o.r.id,
                        error: {
                            code: -32000,
                            message: 'Server disconnected.'
                        }
                    };
                    o.e.set();
                }

                rq = {};
                rq_cnt = 0;
            }

            reconnect();
        };

        sock.onerror = (evt) => {
            console.error(evt);
        };

        sock.onopen = () => {
            if (sq_cnt) {
                for (var r in sq) {
                    var o = sq[r];

                    sock.send(JSON.stringify(o.r));

                    rq[_id] = o;
                    rq_cnt++;
                }
                sq = {};
                sq_cnt = 0;
            }
        };

        sock.onmessage = (m) => {
            var v = JSON.parse(m.data);
            var o = rq[v.id];
            if (o !== undefined) {
                delete rq[v.id];
                rq_cnt--;
            }

            o.v = v;
            o.e.set();
        };
    }

    reconnect();

    return new Proxy({}, {
        get: (target, name) => {
            if (!(name in target)) {
                return target[name] = function() {
                    var _id = id++;
                    var o = {
                        r: {
                            id: _id,
                            method: name,
                            params: slice.call(arguments, 0)
                        },
                        e: new coroutine.Event()
                    };

                    try {
                        sock.send(JSON.stringify(o.r));

                        rq[_id] = o;
                        rq_cnt++;
                    } catch (e) {
                        sq[_id] = o;
                        sq_cnt++;
                    }

                    o.e.wait();

                    if (o.v.error)
                        throw o.v.error.message;

                    return o.v.result;
                };
            }
            return target[name];
        },
        set: (target, name, value) => {
            throw '"' + name + '" is read-only.';
        }
    });
};
