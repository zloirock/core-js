{module, test} = QUnit
module \ES

test 'Object.isFrozen' (assert)!->
  {freeze, isFrozen} = Object
  assert.isFunction isFrozen
  assert.arity isFrozen, 1
  assert.name isFrozen, \isFrozen
  assert.looksNative isFrozen
  assert.nonEnumerable Object, \isFrozen
  for value in [42 \foo no null void]
    assert.ok (try => isFrozen value; on), "accept #{typeof! value}"
    assert.same isFrozen(value), on, "returns true on #{typeof! value}"
  assert.same isFrozen({}), no
  if NATIVE
    assert.ok isFrozen freeze {}