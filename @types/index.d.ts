import * as http from 'http';
import * as ws from 'ws';
import * as coroutine from 'coroutine'

type FibRpcInvokeId = number | string;
type FibRpcCode = number;

interface FibRpcError {
    code: FibRpcCode
    message: string
}

type FibRpcFnHash = {
    [fnName: string]: Function
}
type FibRpcFnPayload = Function | FibRpcFnHash

interface FibRpcCalleeBase {
    id: FibRpcInvokeId;
}
interface FibRpcHttpCallee extends http.Request, FibRpcCalleeBase {
    json(): FibRpcInvokePayload;
}
interface FibRpcInvokePayload {
    id: FibRpcInvokeId
    method?: string;
    params?: any[];
}

type FibRpcCallee = FibRpcHttpCallee | FibRpcWsCallee

interface FibRpcInvokeResult {
    id: FibRpcInvokeId,
    error?: FibRpcError
    result?: any
}
/* ws-rpc about :start */

type FibRpcWsConnUrl = string;

interface FibRpcWsConnHashInfo {
    e: coroutine.Event
    r?: FibRpcInvokePayload
    v?: FibRpcInvokeResult
}
interface FibRpcWsConnHash {
    /* connName is just FibRpcInvokeId */
    [connName: string]: FibRpcWsConnHashInfo
}

interface FibRpcWsSocketMessage extends ws.Message {
    json(): FibRpcInvokePayload
}
/* ws-rpc about :end */

interface FibRpcWsCallee extends ws.Socket, FibRpcCalleeBase {}

type FibRpcInvokeArg = FibRpcHttpCallee | FibRpcWsSocketMessage

interface FibRpcInvoke {
    (m: FibRpcInvokeArg): FibRpcInvokeResult
}

interface FibRpcHdlr {
    (m: FibRpcCallee): void;
}

interface FibRpcGenerator {
    (fn: FibRpcFnPayload): FibRpcHdlr
}

declare module "fib-rpc" {
    export = FibRpcGenerator
}
