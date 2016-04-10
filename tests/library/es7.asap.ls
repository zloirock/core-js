{module, test} = QUnit
module 'ES6'

test 'asap' (assert)->
  {asap} = core
  assert.expect 4
  assert.isFunction asap
  assert.arity asap, 1
  assert.name asap, \asap
  async = assert.async!
  done = no
  asap !->
    if !done
      done = on
      assert.ok after, \works
      async!
  setTimeout (!->
    if !done
      done = on
      assert.ok no, \fails
      async!
  ), 1e3
  after = on