{module, test} = QUnit
module \ESNext

test 'asap' (assert)->
  {asap} = core
  assert.expect 3
  assert.isFunction asap
  assert.arity asap, 1
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
  ), 3e3
  after = on