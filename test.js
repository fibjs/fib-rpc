var test = require("test");
test.setup();

var rpc = require('./');
var http = require('http');
var ws = require('ws');

describe("rpc", () => {
    var ss = [];

    after(() => {
        ss.forEach((s) => {
            s.close();
        });
    });

    var jr = rpc.handler({
        aaaa: function(p1, p2) {
            return p1 + ',' + p2;
        }
    });

    function _call(r) {
        var m = new http.Request();

        m.value = 'test/tttt/tttt/';
        m.setHeader("Content-Type", "application/json, charset=utf-8;");
        m.body.write(JSON.stringify(r));

        jr(m);

        m.response.body.rewind();
        return m.response.readAll().toString();
    }

    it("handler", () => {
        assert.equal(_call({
            method: 'aaaa',
            params: [100, 200],
            id: 1234
        }), '{"id":1234,"result":"100,200"}');
    });

    it("content type missing", () => {
        var m = new http.Request();

        m.value = 'test/tttt/tttt/';
        m.body.write(JSON.stringify({
            method: 'aaaa',
            params: [100, 200],
            id: 1234
        }));

        jr(m);

        m.response.body.rewind();
        assert.equal(m.response.readAll().toString(),
            '{"id":-1,"error":{"code":-32600,"message":"Content-Type is missing."}}');
    });

    it("method missing", () => {
        assert.equal(_call({
            params: [100, 200],
            id: 1234
        }), '{"id":1234,"error":{"code":-32600,"message":"Invalid Request."}}');
    });

    it("method not exists", () => {
        assert.equal(_call({
            method: 'aaaa1',
            params: [100, 200],
            id: 1234
        }), '{"id":1234,"error":{"code":-32601,"message":"Method not found."}}');
    });

    it("id missing", () => {
        assert.equal(_call({
            method: 'aaaa',
            params: [100, 200]
        }), '{"result":"100,200"}');
    });

    it("params missing", () => {
        assert.equal(_call({
            method: 'aaaa',
            id: 1234
        }), '{"id":1234,"result":"undefined,undefined"}');
    });

    it("Invalid params", () => {
        assert.equal(_call({
            method: 'aaaa',
            params: 123,
            id: 1234
        }), '{"id":1234,"error":{"code":-32602,"message":"Invalid params."}}');
    });

});

describe("websocket rpc", function() {
    var svr;
    var remoting;

    before(function() {
        svr = new http.Server(8811, ws.upgrade(rpc.handler({
            test: function(v1, v2) {
                return v1 + v2;
            }
        })));
        svr.asyncRun();
    })

    after(function() {
        svr.stop();
        remoting = undefined;
    })

    it("connect", function() {
        remoting = rpc.connect("ws://127.0.0.1:8811");
    });

    it("test", function() {
        assert.equal(remoting("test")(1, 2), 3);
    });

    it("id not exists", function() {
        assert.throws(function() {
            remoting("unknown_id")(1, 2);
        });
    });
});

describe("new websocket rpc", function() {
    var svr;
    var remoting;

    before(function() {
        svr = new http.Server(8811, ws.upgrade(rpc.handler({
            test: function(v1, v2) {
                return v1 + v2;
            }
        })));
        svr.asyncRun();
    })

    after(function() {
        svr.stop();
        remoting = undefined;
    })

    it("connect", function() {
        remoting = rpc.connect1("ws://127.0.0.1:8811");
    });

    it("test", function() {
        assert.equal(remoting.test(1, 2), 3);
    });

    it("id not exists", function() {
        assert.throws(function() {
            remoting.unknown_id(1, 2);
        });
    });
});

process.exit(test.run(console.DEBUG));
