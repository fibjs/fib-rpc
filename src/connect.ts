import * as ws from "ws";
import coroutine = require("coroutine");
import { FibRpcWsConnUrl, FibRpcWsConnHash, FibRpcWsConnHashInfo, FibRpcInvokeResult, FibRpcWsSocketMessage } from "../@types";

const slice = Array.prototype.slice;

export = function (url: FibRpcWsConnUrl) {
    var sock: ws.Socket;
    var id = 0;

    /* start queue */
    var sq: FibRpcWsConnHash = {};
    var sq_cnt: number = 0;

    /* reconnect queue */
    var rq: FibRpcWsConnHash = {};
    var rq_cnt: number = 0;

    function reconnect() {
        sock = new ws.Socket(url);
        sock.onclose = () => {
            if (rq_cnt) {
                for (var r in rq) {
                    var o: FibRpcWsConnHashInfo = rq[r];
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
                    var o: FibRpcWsConnHashInfo = sq[r];

                    sock.send(JSON.stringify(o.r));

                    rq[o.r.id] = o;
                    rq_cnt++;
                }
                sq = {};
                sq_cnt = 0;
            }
        };

        sock.onmessage = (m: FibRpcWsSocketMessage) => {
            var v: FibRpcInvokeResult = m.json();
            var o: FibRpcWsConnHashInfo = rq[v.id];
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
                    var o: FibRpcWsConnHashInfo = {
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
