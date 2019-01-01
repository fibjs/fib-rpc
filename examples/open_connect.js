const ws = require('ws')
const http = require('http')

const rpc = require('fib-rpc')

const svr = new http.Server(8812, ws.upgrade(
    rpc.handler(
        {
            test: function (args) {
                return args[0] + args[1];
            }
        }
    ))
);
svr.asyncRun();

const remoting = rpc.open_connect("ws://127.0.0.1:8812");

console.log(`remote.test([1, 2]) === ${remoting.test([1, 2])}`)
console.assert(remoting.test([1, 2]) === 3, 'test method is invalid.')

process.exit(0)