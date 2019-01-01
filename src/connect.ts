/// <reference path="../@types/index.d.ts" />

import ws = require("ws");
import coroutine = require("coroutine");

const slice = Array.prototype.slice;

import errCodeMsg = require('./err_code_msg');

const connect: FibRpcConnectModule.FibRpcConnect = function (url: FibRpcConnectModule.FibRpcWsConnUrl) {
    var sock: ws.Socket;
    var id = 0;

    /* send queue */
    var sq: FibRpcConnectModule.FibRpcWsConnHash = {};
    var sq_cnt: number = 0;

    /* response queue */
    var rq: FibRpcConnectModule.FibRpcWsConnHash = {};
    var rq_cnt: number = 0;

    function reconnect() {
        sock = new ws.Socket(url);
        sock.onclose = () => {
            if (rq_cnt) {
                for (var r in rq) {
                    var o: FibRpcConnectModule.FibRpcWsConnHashInfo = rq[r];
                    o.v = {
                        id: o.r.id,
                        error: {
                            code: -32000,
                            message: errCodeMsg["32000"]
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
                    var o: FibRpcConnectModule.FibRpcWsConnHashInfo = sq[r];

                    sock.send(JSON.stringify(o.r));

                    rq[o.r.id] = o;
                    rq_cnt++;
                }
                sq = {};
                sq_cnt = 0;
            }
        };

        sock.onmessage = (m: FibRpcInvoke.FibRpcInvokeWsSocketMessage) => {
            var v: FibRpc_JSONRPC.JsonRpcResponsePayload = m.json();
            var o: FibRpcConnectModule.FibRpcWsConnHashInfo = rq[v.id];
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
        get: (target, name: string) => {
            if (!(name in target)) {
                return target[name] = function () {
                    var _id = id++;
                    var o: FibRpcConnectModule.FibRpcWsConnHashInfo = {
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
        set: (target, name: string, value) => {
            throw '"' + name + '" is read-only.';
        }
    });
};

export = connect;