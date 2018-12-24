const ws = require('ws')
const http = require('http')

const rpc = require('fib-rpc')

const svr = new http.Server(8811, ws.upgrade(
    rpc.handler(
        {
            test: function (v1, v2) {
                return v1 + v2;
            }
        }
    ))
);
svr.asyncRun();

const remoting = rpc.connect("ws://127.0.0.1:8811");

console.log(`remote.test(1, 2) === ${remoting.test(1, 2)}`)
console.assert(remoting.test(1, 2) === 3, 'test method is invalid.')

process.exit(0)