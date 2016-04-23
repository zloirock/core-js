{module, test} = QUnit
module 'ES6'

test 'asap' (assert)->
  assert.expect 5
  assert.isFunction asap
  assert.arity asap, 1
  assert.name asap, \asap
  assert.looksNative asap
  async = assert.async!
  done = no
  asap !->
    if !done
      done := on
      assert.ok after, \works
      async!
  setTimeout (!->
    if !done
      done := on
      assert.ok no, \fails
      async!
  ), 3e3
  after = on