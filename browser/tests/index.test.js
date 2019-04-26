import { assert } from 'chai'
import * as rpc from '../src/index'

describe('lib', () => {
  it('should work', () => {
    assert.equal(1, 1)
  })

  it('open_connect', () => {
    const remoting = rpc.open_connect('ws://127.0.0.1:8812/open_ws')

    remoting.call('test', [1, 2]).then(result => {
      console.log('result', result)

      console.assert(
        result === 3,
        'test method is invalid.'
      )
    })
  })
})
