var test = require('test')
test.setup()

var rpc = require('../')
var http = require('http')
var ws = require('ws')

function get_call (jr) {
  return (r) => rpc.httpCall(jr, r)
}

describe('rpc', () => {
  var ss = []

  after(() => {
    ss.forEach((s) => {
      s.close()
    })
  })

  describe('handler: method dictionary', () => {
    describe('basic handler', () => {
      var jr = rpc.handler({
        aaaa: function (p1, p2) {
          return p1 + ',' + p2
        }
      })

      var _call = get_call(jr)

      it('handler', () => {
        assert.deepEqual(
          _call({
            method: 'aaaa',
            params: [100, 200],
            id: 1234
          }).json(),
          {"id":1234,"result":"100,200"}
        )
      })

      it('content type missing', () => {
        var m = new http.Request()

        m.value = 'test/tttt/tttt/'
        m.body.write(JSON.stringify({
          method: 'aaaa',
          params: [100, 200],
          id: 1234
        }))

        jr(m)

        m.response.body.rewind()
        assert.deepEqual(
          m.response.json(),
          {"id":-1,"error":{"code":-32700,"message":"Parse error."}}
        )
      })

      describe('content type Invalid', () => {
        function error_call (ctype) {
          var m = new http.Request()

          m.value = 'test/tttt/tttt/'
          m.setHeader('Content-Type', ctype)
          m.write(JSON.stringify({
            method: 'aaaa',
            params: [100, 200],
            id: 1234
          }))

          jr(m);

          m.response.body.rewind()
          assert.deepEqual(
            m.response.json(),
            {"id":-1,"error":{"code":-32700,"message":"Parse error."}}
          )
        }

        ;[
          'charset=utf-8;application/json;',
          'application/json, charset=utf-8;',
          'application/json-error;'
        ].forEach(function (ctype) {
          it(`invalid Content-Type: ${ctype}`, function () {
            error_call(ctype)
          });
        })
      })

      it('method missing', () => {
        assert.deepEqual(
          _call({
            params: [100, 200],
            id: 1234
          }).json(),
          {"id":1234,"error":{"code":-32600,"message":"Invalid Request."}}
        )
      })

      it('method not exists', () => {
        assert.deepEqual(
          _call({
            method: 'aaaa1',
            params: [100, 200],
            id: 1234
          }).json(),
          {"id":1234,"error":{"code":-32601,"message":"Method not found."}}
        )
      })

      it('id missing', () => {
        assert.deepEqual(
          _call({
            method: 'aaaa',
            params: [100, 200]
          }).json(),
          {"result":"100,200"}
        )
      })

      it('params missing', () => {
        assert.deepEqual(
          _call({
            method: 'aaaa',
            id: 1234
          }).json(),
          {"id":1234,"result":"undefined,undefined"}
        )
      })

      it('Invalid params', () => {
        assert.deepEqual(
          _call({
            method: 'aaaa',
            params: 123,
            id: 1234
          }).json(),
          {"id":1234,"error":{"code":-32602,"message":"Invalid params."}}
        )
      })
    })

    describe('open_handler', () => {
      var jr = rpc.open_handler({
        aaaa: function (args) {
          return args[0] + ',' + args[1]
        }
      })

      var _call = get_call(jr)

      it('params: array', () => {
        assert.deepEqual(
          _call({
            method: 'aaaa',
            params: [100, 200],
            id: 1234
          }).json(),
          {"id":1234,"result":"100,200"}
        )
      })

      it('params: object', () => {
        assert.deepEqual(
          _call({
            method: 'aaaa',
            params: {0: 1, 1: 0},
            id: 1234
          }).json(),
          {"id":1234,"result":"1,0"}
        )
      })
    })

    describe('errors', () => {
      var jr = rpc.open_handler({
        Unauthorized: function (args) {
          throw rpc.rpcError(1, 'Unauthorized')
        },
        NotAllowed: function (args) {
          throw rpc.rpcError(2)
        },
        ExeError: function (args) {
          throw rpc.rpcError(3, 'Execution error 2')
        }
      }, {
        log_error_stack: false,
        server_error_messages: {
          2: 'Action not allowed',
          3: 'Execution error'
        }
      });

      var _call = get_call(jr)

      it('custom errors -- specified when throwing', () => {
        assert.deepEqual(
          _call({
            method: 'Unauthorized',
            params: {},
            id: 1234
          }).json(),
          {
            "id":1234,
            "error": {
              code: 1,
              message: "Unauthorized"
            }
          }
        )
      });

      it('custom errors -- specified by `server_error_messages`', () => {
        assert.deepEqual(
          _call({
            method: 'NotAllowed',
            params: {},
            id: 1234
          }).json(),
          {
            "id":1234,
            "error": {
              code: 2,
              message: "Action not allowed"
            }
          }
        )
      });

      it('custom errors -- specified by `server_error_messages` but also provided when throwing', () => {
        assert.deepEqual(
          _call({
            method: 'ExeError',
            params: {},
            id: 1234
          }).json(),
          {
            "id":1234,
            "error": {
              code: 3,
              message: "Execution error 2"
            }
          }
        )
      });
    })
  })

  describe('handler: function', () => {
    var jr = rpc.open_handler(function (input) {
      return `${input.a},${input.b}`
    })

    var _call = get_call(jr)

    it('params: array', () => {
      assert.deepEqual(
        _call({
          method: 'aaaa',
          params: [100, 200],
          id: 1234
        }).json(),
        {"id":1234,"result":"undefined,undefined"}
      )
    })

    it('params: object', () => {
      assert.deepEqual(
        _call({
          method: 'aaaa',
          params: {a: 1, b: 0},
          id: 1234
        }).json(),
        {"id":1234,"result":"1,0"}
      )
    })
  })
})

describe('websocket rpc', function () {
  var svrs = {}
  var handlers = {}
  var remotings = {}
  var _calls = {}

  describe('spread handler', () => {
    before(function () {
      handlers.spread = rpc.handler({
        test: function (v1, v2) {
          return v1 + v2
        },
        integerAdd: function (v1, v2) {
          if (!Number.isInteger(v1) || !Number.isInteger(v2))
              throw rpc.rpcError(4010000, 'Addend must be integer')
                      
          return v1 + v2
        }
      }, {
        log_error_stack: false,
        server_error_messages: {
          4010000: '[handler]Addend must be integer'
        }
      });
  
      _calls.spread = get_call(handlers.spread);
      
      svrs.spread = new http.Server(8811, ws.upgrade(handlers.spread))
      svrs.spread.asyncRun()
    })
  
    after(function () {
      svrs.spread.stop()
  
      remotings = {}
    })
  
    it('connect', function () {
      remotings.spread = rpc.connect('ws://127.0.0.1:8811')
    })
  
    it('remote: test', function () {
      assert.equal(remotings.spread.test(1, 2), 3)
      assert.equal(remotings.spread.test({v1: 1, v2: 2}), '[object Object]undefined')
      
      assert.throws(() => {
        assert.equal(rpc.open_connect('ws://127.0.0.1:8811').test({v1: 1, v2: 2}), 3)
      })
    })
  
    describe('remote: integerAdd', function () {
      it('correct params', () => {
        assert.equal(remotings.spread.integerAdd(1, 2), 3)
      });
  
      it('catch error', () => {
        try {
          remotings.spread.integerAdd(1.1, 2)
        } catch (err_msg) {
          assert.equal(err_msg, 'Addend must be integer')
        }
      });
  
      it('from http request', () => {
        assert.deepEqual(
          rpc.httpCall(handlers.spread, {
            method: 'integerAdd',
            params: [1.1, 2],
            id: 1234
          }).json(),
          {
            "id":1234,
            "error":{
              "code": 4010000,
              "message": "Addend must be integer"
            }
          }
        );
      });
    })
  
    it('special test', function () {
      // arguments ---sliced---> [NaN, null] ---json_encode---> [null, null] ---> null + null -> 0
      assert.strictEqual(remotings.spread.test(NaN, null), 0)
      assert.strictEqual(remotings.spread.test(null, null), 0)
      assert.strictEqual(remotings.spread.test(null, NaN), 0)
    })
  
    it('method not exists', function () {
      assert.throws(function () {
        remotings.spread.unknown_method(1, 2)
      })
    })
  });

  describe('open handler', () => {
    before(function () {
      handlers.open = rpc.open_handler({
        test: function (args) {
          return args.v1 + args.v2
        },
        integerAdd: function (args) {
          if (!Number.isInteger(args.v1) || !Number.isInteger(args.v2))
              throw rpc.rpcError(4010000)
                      
          return args.v1 + args.v2
        },
      }, {
        log_error_stack: false,
        server_error_messages: {
          4010000: '[open_handler]Addend must be integer'
        }
      });
  
      _calls.open = get_call(handlers.open);
      
      svrs.open = new http.Server(8812, ws.upgrade(handlers.open))
      svrs.open.asyncRun()
    })
  
    after(function () {
      svrs.open.stop()
  
      remotings = {}
    })
  
    it('connect', function () {
      remotings.open = rpc.open_connect('ws://127.0.0.1:8812')
    })
  
    it('remote: test', function () {
      assert.throws(() => {
        assert.equal(rpc.connect('ws://127.0.0.1:8812').test({v1: 1, v2: 2}), 3)
      })
      
      assert.equal(remotings.open.test({v1: 1, v2: 2}), 3)
    })
  
    describe('remote: integerAdd', function () {
      it('correct params', () => {
        assert.equal(remotings.open.integerAdd({v1: 1, v2: 2}), 3)
      });
  
      it('catch error', () => {
        try {
          remotings.open.integerAdd({ v1: 1.1, v2: 2})
        } catch (err_msg) {
          assert.equal(err_msg, '[open_handler]Addend must be integer')
        }
      });
  
      it('from http request', () => {
        assert.deepEqual(
          rpc.httpCall(handlers.open, {
            method: 'integerAdd',
            params: {v1: 1.1, v2: 2},
            id: 1234
          }).json(),
          {
            "id":1234,
            "error":{
              "code": 4010000,
              "message": "[open_handler]Addend must be integer"
            }
          }
        );
      });
    })
  
    it('special test', function () {
      // arguments ---sliced---> [NaN, null] ---json_encode---> [null, null] ---> null + null -> 0
      assert.strictEqual(remotings.open.test({ v1: NaN, v2: null }), 0)
      assert.strictEqual(remotings.open.test({ v1: null, v2: null }), 0)
      assert.strictEqual(remotings.open.test({ v1: null, v2: NaN }), 0)
    })
  
    it('method not exists', function () {
      assert.throws(function () {
        remotings.open.unknown_method({})
      })
    })
  });
})

if (require.main === module)
  process.exit(test.run(console.DEBUG))
