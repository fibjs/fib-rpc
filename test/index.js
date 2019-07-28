var test = require('test')
test.setup()

var rpc = require('../')

if (!require.main) require.main = module

describe('modules', () => {
  describe('#rpcError', () => {
    assert.isFunction(rpc.rpcError)

    var errObj
    ;[
      [ ['-32768'], [true]],
      [ ['-32699'], [true]],
      
      /* predefined */
      [
        ['-32600', "Invalid Request."], []
      ],
      [
        ['-32601', "Method not found."], []
      ],
      [
        ['-32602', "Invalid params."], []
      ],
      [
        ['-32603', "Internal error."], []
      ],
      [
        ['-32700', "Parse error."], []
      ],

      /* server implementation-defined */
      [
        ['-32000', "Server disconnected."], []
      ],

      [
        ['-32099', "Server error."], []
      ],

      /* custom */
      [
        ['-31999', "Custom 1'"], [, true]
      ],
      [
        ['+40100', "Custom 2'"], [, true]
      ],
    ].forEach(([[err_code, message, data], [is_reserved, is_custom]]) => {
      if (is_reserved) {
        it(`reserved_code: ${err_code} -- not usable, throw error`, () => {
          assert.throws(() => {
            rpc.rpcError(err_code)
          })
        })
      } else if (is_custom) {
        it(`error_code: ${err_code} --> msg: ${message} [valid custom code]`, () => {
          // errObj = rpc.rpcError({ code: err_code, message });
          // assert.propertyVal(errObj, 'code', parseInt(err_code));
          // assert.propertyVal(errObj, 'message', message);

          errObj = rpc.rpcError(err_code, message);
          assert.propertyVal(errObj, 'code', parseInt(err_code));
          assert.propertyVal(errObj, 'message', message);
        });
      } else {
        it(`error_code: ${err_code} --> msg: ${message}`, () => {
          errObj = rpc.rpcError(err_code, Date.now() + '');
          assert.propertyVal(errObj, 'code', parseInt(err_code));
          assert.propertyVal(errObj, 'message', message);
        });
      }
    });
  });
});

require('./handler')

test.run(console.DEBUG)
