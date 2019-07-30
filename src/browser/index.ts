/// <reference no-default-lib="true" />


/// <reference lib="dom" />

function reconnect () {
    
}

function fakeUuid () {
    return Date.now()
}

/**
 * use jsonrpc id as event type
 */
class JsonRpcEventRequest extends Event {
    payload: FibRpcJsonRpcSpec.RequestPayload
    
    constructor (
        method: FibRpcJsonRpcSpec.RequestPayload['method'],
        params: FibRpcJsonRpcSpec.RequestPayload['params']
        // type: string,
        // init: EventInit
    ) {
        const jid = fakeUuid()
        super(`${jid}`)

        this.payload = {
            id: jid,
            jsonrpc: "2.0",
            method,
            params
        }
    }
}

/**
 * use jsonrpc id as event type
 */
class JsonRpcEventResponse extends Event {
    payload: FibRpcJsonRpcSpec.ResponsePayload
    
    constructor (
        id: FibRpcJsonRpcSpec.ResponsePayload['id'],
        error: FibRpcJsonRpcSpec.ResponsePayload['error'],
        result: FibRpcJsonRpcSpec.ResponsePayload['result']
        // type: string,
        // init: EventInit
    ) {
        super(`${id}`)

        this.payload = {
            id: id,
            jsonrpc: "2.0",
            error,
            result
        }
    }
}

function use (
    ws: WebSocket,
    picker: {
        (json: any, evt: MessageEvent): boolean
    } = () => false,
    callback: {
        (json: any, evt: MessageEvent): void
    }
) {
    ws.onmessage = ((ev: MessageEvent) => {
        const json = JSON.parse(ev.data)

        if (!picker(json, ev))
            return ;
    })
}

export default class RpcClient {
    _ws: WebSocket
    
    constructor (
        url: string,
    ) {
        this._ws = new WebSocket(url)
        
    }

    invoke<T = any> (
        method: FibRpcJsonRpcSpec.RequestPayload['method'],
        params: FibRpcJsonRpcSpec.RequestPayload['params']
    ): Promise<T> {
        const id = fakeUuid()

        const emitter = new EventTarget();
        emitter.addEventListener('ready', () => {
            _send()
        });
        
        const _send = () => {
            this._ws.send(JSON.stringify(
                {
                    id,
                    jsonrpc: "2.0",
                    method,
                    params
                }
            ))
        }

        return new Promise(function (resolve, reject) {
            const reqEvent = new JsonRpcEventRequest(method, params)

            const listener = (evt: JsonRpcEventResponse) => {
                if (evt.payload.id === id)
                    resolve(evt.target as any)

                // TODO: reject when timeout

                // always remove listener
                emitter.removeEventListener(reqEvent.type, listener);
            }

            emitter.addEventListener(reqEvent.type, listener);

            emitter.dispatchEvent(reqEvent);
        })
    }
}