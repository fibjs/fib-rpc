const assert = require('assert')
const http = require('http')

const rpc = require('fib-rpc')

var js_remote = Math.random(0, 1) > 0.5 ? (
    rpc.handler({
        foo: function (args) {
            return args.p1 + args.p2;
        }
    }, { allow_anytype_params: true })
) : (
    rpc.open_handler({
        foo: function (args) {
            return args.p1 + args.p2;
        }
    })
)

function js_call(r) {
    var m = new http.Request();

    m.value = 'test/tttt/tttt/';
    m.json(r);

    js_remote(m);

    m.response.body.rewind();
    return m.response.readAll().toString();
}

assert.equal(
    js_call({
        // method is required
        method: 'foo',
        // params is required and must be array
        params: {p1: 100, p2: 200},
        // id is required
        id: 1234
    })
    , '{"id":1234,"result":300}'
)