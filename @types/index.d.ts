import * as http from 'http';
import * as ws from 'ws';
import * as coroutine from 'coroutine'
import { Handler } from 'mq';

type FibRpcInvokeId = number | string;
type FibRpcCode = number;

type JsonRpcPrimitive = string | number | boolean | null
interface JsonRpcParamObjectType {
    [key: string]: any;
}
type JsonRpcParamArrayType = (JsonRpcPrimitive | JsonRpcParamObjectType | Array<JsonRpcPrimitive | JsonRpcParamObjectType>)[]
type JsonRpcParamsType = JsonRpcParamObjectType | JsonRpcParamArrayType

type JsonRpcRestStyleParamsType = (JsonRpcPrimitive | JsonRpcParamObjectType)[]

// type JsonRpcInvokedFunction = Function
interface JsonRpcInvokedFunction {
    (...params: JsonRpcRestStyleParamsType): any
}

type FibRpcResultData = any

interface FibRpcError {
    code: FibRpcCode
    message: string
}

type FibRpcFnHash = {
    [fnName: string]: JsonRpcInvokedFunction
}
type FibRpcFnPayload = JsonRpcInvokedFunction | FibRpcFnHash

interface FibRpcCalleeBase {
    id: FibRpcInvokeId;
}
interface FibRpcHttpCallee extends http.Request, FibRpcCalleeBase {
    json(): FibRpcInvokePayload;
}
interface FibRpcInvokePayload {
    id: FibRpcInvokeId
    method?: string;
    params?: JsonRpcParamsType
}

type FibRpcCallee = FibRpcHttpCallee | FibRpcWsCallee

interface FibRpcInvokedResult {
    id: FibRpcInvokeId,
    error?: FibRpcError
    result?: FibRpcResultData
}
/* ws-rpc about :start */

type FibRpcWsConnUrl = string;

interface FibRpcWsConnHashInfo {
    e: coroutine.Event
    r?: FibRpcInvokePayload
    v?: FibRpcInvokedResult
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
    (m: FibRpcInvokeArg): FibRpcInvokedResult
}

interface FibRpcHdlr {
    (m: FibRpcCallee): void;
}

interface FibRpcHandler {
    (fn: FibRpcFnPayload): FibRpcHdlr
}

/* @deprecated */
type FibRpcGenerator = FibRpcHandler

interface FibRpcConnect {
    (url: FibRpcWsConnUrl): ProxyHandler<any>
}

declare module "fib-rpc" {
    module FibRpcModule {
        export const handler: FibRpcHandler
        export const connect: FibRpcConnect
    }

    export = FibRpcModule
}
