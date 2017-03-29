var test = require("test");
test.setup();

var rpc = require('./');
var http = require('http');
var ws = require('ws');

describe("rpc", () => {
    var ss = [];

    var m = new http.Request();

    m.value = 'test/tttt/tttt/';
    m.setHeader("Content-Type", "application/json, charset=utf-8;");
    m.body.write(JSON.stringify({
        method: 'aaaa',
        params: [100, 200],
        id: 1234
    }));

    after(() => {
        ss.forEach((s) => {
            s.close();
        });
    });

    it("handler", () => {
        var jr = rpc.handler(function(p1, p2) {
            return p1 + ',' + p2;
        });

        jr(m);

        m.response.body.rewind();
        assert.equal(m.response.body.read().toString(),
            '{"id":1234,"result":"100,200"}');
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

process.exit(test.run(console.DEBUG));
