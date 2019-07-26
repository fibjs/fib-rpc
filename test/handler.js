var test = require('test')
test.setup()

var rpc = require('../')
var http = require('http')
var ws = require('ws')

describe('rpc', () => {
  var ss = []

  after(() => {
    ss.forEach((s) => {
      s.close()
    })
  })

  function get_call (jr) {
    return function (r) {
      var m = new http.Request()

      m.value = 'test/tttt/tttt/'
      m.json(r)

      jr(m)

      m.response.body.rewind()
      return m.response
    }
  }

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
  var svrs = []
  var remotings = []

  before(function () {
    svrs[0] = new http.Server(8811, ws.upgrade(rpc.handler({
      test: function (v1, v2) {
        return v1 + v2
      }
    })))

    svrs[1] = new http.Server(8812, ws.upgrade(rpc.open_handler({
      test: function (args) {
        return args.v1 + args.v2
      }
    })))
    
    svrs.forEach(srv => srv.asyncRun())
  })

  after(function () {
    svrs.forEach(srv => srv.stop())

    remotings = []
  })

  it('connect', function () {
    remotings[0] = rpc.connect('ws://127.0.0.1:8811')
    remotings[1] = rpc.open_connect('ws://127.0.0.1:8812')
  })

  it('test', function () {
    assert.equal(remotings[0].test(1, 2), 3)
    assert.equal(remotings[0].test({v1: 1, v2: 2}), '[object Object]undefined')
    
    assert.throws(() => {
      assert.equal(rpc.open_connect('ws://127.0.0.1:8811').test({v1: 1, v2: 2}), 3)
    })
    
    assert.equal(remotings[1].test({v1: 1, v2: 2}), 3)
  })

  it('special test', function () {
    // arguments ---sliced---> [NaN, null] ---json_encode---> [null, null] ---> null + null -> 0
    assert.strictEqual(remotings[0].test(NaN, null), 0)
    assert.strictEqual(remotings[0].test(null, null), 0)
    assert.strictEqual(remotings[0].test(null, NaN), 0)
  })

  it('method not exists', function () {
    assert.throws(function () {
      remotings[0].unknown_method(1, 2)
    })
  })
})

process.exit(test.run(console.DEBUG))
