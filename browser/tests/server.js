#!/usr/bin/fibjs

const ws = require('ws')
const http = require('http')
const path = require('path')
const coroutine = require('coroutine')

const rpc = require('fib-rpc')

const BROWSER_ROOT = path.resolve(__dirname, '..')

const svr = new http.Server(8812, {
  '/open_ws': ws.upgrade(
    rpc.open_handler(
      {
        test: function (args) {
          return args[0] + args[1]
        }
      }
    )
  ),
  '/ws': ws.upgrade(
    rpc.handler(
      {
        test: function (...args) {
          return args[0] + args[1]
        }
      }
    )
  ),
  '*': http.fileHandler(BROWSER_ROOT)
})

svr.run(() => void 0)
console.log(`server started at port ${svr.socket.localPort}`)

coroutine.start(() => {
  process.chdir(BROWSER_ROOT)
  while (true) {
    process.run(
      'npm',
      [
        'run',
        'build'
      ]
    )

    coroutine.sleep(1000)
  }
})
