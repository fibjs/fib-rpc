var ws = require("ws");
var io = require("io");
var Pool = require("fib-pool");

var slice = Array.prototype.slice;

module.exports = function (url) {
    var pool = Pool(function () {
        return ws.connect(url);
    });

    return function (id) {
        return function () {
            var jss = [];

            jss.push('{"method":"');
            jss.push(id);

            if (arguments.length > 0) {
                jss.push('","params":');
                jss.push(JSON.stringify(slice.call(arguments, 0)));
                jss.push("}");
            } else jss.push('"}');

            var ret = pool(function (conn) {
                var msg = new ws.Message();
                msg.type = ws.TEXT;
                msg.write(jss.join(""));

                msg.sendTo(conn);

                var msg = new ws.Message();
                msg.readFrom(conn);

                return msg.json();
            });

            if (ret.error)
                throw ret.error.message;

            return ret.result;
        };
    };
};