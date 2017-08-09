{module, test} = QUnit
module \ES

test 'Object.isFrozen' (assert)!->
  {isFrozen} = core.Object
  assert.isFunction isFrozen
  assert.arity isFrozen, 1
  for value in [42 \foo no null void]
    assert.ok (try => isFrozen value; on), "accept #{typeof! value}"
    assert.same isFrozen(value), on, "returns true on #{typeof! value}"
  assert.same isFrozen({}), no