const assert = require('assert')
const http = require('http')

const rpc = require('fib-rpc')

var js_remote = rpc.handler({
    foo: function (p1, p2) {
        return p1 + ',' + p2;
    },

    foo1: function (args) {
        return args.p1 + args.p2;
    }
});

function http_call(r) {
    var m = new http.Request();

    m.value = 'test/tttt/tttt/';
    m.json(r);

    js_remote(m);

    m.response.body.rewind();
    return m.response.readAll().toString();
}

assert.equal(
    http_call({
        // method is required
        method: 'foo',
        // params is required and must be array
        params: [100, 200],
        // id is required
        id: 1234
    })
    , '{"id":1234,"result":"100,200"}'
);

assert.equal(
    http_call({
        // method is required
        method: 'foo1',
        // params is required and must be array
        params: [{p1: 100, p2: 200}],
        // id is required
        id: 1234
    })
    , '{"id":1234,"result":300}'
);