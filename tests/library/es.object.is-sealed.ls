{module, test} = QUnit
module \ES

test 'Object.isSealed' (assert)!->
  {isSealed} = core.Object
  assert.isFunction isSealed
  assert.arity isSealed, 1
  for value in [42 \foo no null void]
    assert.ok (try => isSealed value; on), "accept #{typeof! value}"
    assert.same isSealed(value), on, "returns true on #{typeof! value}"
  assert.same isSealed({}), no