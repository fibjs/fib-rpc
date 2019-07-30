/// <reference path="../@types/index.d.ts" />

import ws = require("ws");
import coroutine = require("coroutine");
import { setRpcError } from "./isomorph/response";
import { rpcError } from "./isomorph/error";

const connect: FibRpcConnectModule.FibRpcConnect = function (
    url: FibRpcConnectModule.FibRpcWsConnUrl,
    opts?: FibRpcConnectModule.ConnectOptions
): FibRpcInvoke.FibRpcInvokeClient {
    let sock: Class_WebSocket;
    let id = 0;
    const {
        open: use_open_handler = false,
        log_error_stack = true,
        throw_error = false,
        ws_options = undefined
    } = opts || {};

    const get_ws_options = typeof ws_options === 'function' ? ws_options : () => ws_options

    /* send queue */
    let sq: FibRpcConnectModule.FibRpcWsConnHash = {};
    let sq_cnt: number = 0;

    /* response queue */
    let rq: FibRpcConnectModule.FibRpcWsConnHash = {};
    let rq_cnt: number = 0;

    function reconnect() {
        sock = new ws.Socket(url, get_ws_options({ url }));
        sock.onclose = () => {
            if (rq_cnt) {
                for (const r in rq) {
                    const o: FibRpcConnectModule.FibRpcWsCoroutinePayload = rq[r];
                    o.v = setRpcError(o.r.id, -32000);
                    o.e.set();
                }

                rq = {};
                rq_cnt = 0;
            }

            reconnect();
        };

        sock.onerror = (evt: Class_EventInfo) => {
            if (log_error_stack)
                console.error(evt);
        };

        sock.onopen = () => {
            if (sq_cnt) {
                for (const r in sq) {
                    const o: FibRpcConnectModule.FibRpcWsCoroutinePayload = sq[r];

                    sock.send(JSON.stringify(o.r));

                    rq[o.r.id] = o;
                    rq_cnt++;
                }
                sq = {};
                sq_cnt = 0;
            }
        };

        sock.onmessage = (m: FibRpcInvoke.FibRpcInvokeWsSocketMessage) => {
            const v: FibRpcJsonRpcSpec.ResponsePayload = m.json();
            const o: FibRpcConnectModule.FibRpcWsCoroutinePayload = rq[v.id];
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
        get: (target: Fibjs.AnyObject, name: string) => {
            if (!(name in target)) {
                return target[name] = function () {
                    const _id = id++;
                    const params = Array.prototype.slice.call(arguments, 0)
                    const o: FibRpcConnectModule.FibRpcWsCoroutinePayload = {
                        r: {
                            id: _id,
                            method: name,
                            params: use_open_handler ? params[0] : params
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

                    if (o.v.error) {
                        if (!throw_error)
                            throw o.v.error.message;
                        else
                            throw rpcError(
                                o.v.error.code,
                                o.v.error.message,
                                o.v.error.data
                            );
                    }

                    return o.v.result;
                };
            }
            return target[name];
        },
        set: (target, name: string, value) => {
            throw `"${name}" is read-only.`;
        }
    });
};

export = connect;