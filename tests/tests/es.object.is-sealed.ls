{module, test} = QUnit
module \ES

test 'Object.isSealed' (assert)!->
  {seal, isSealed} = Object
  assert.isFunction isSealed
  assert.arity isSealed, 1
  assert.name isSealed, \isSealed
  assert.looksNative isSealed
  assert.nonEnumerable Object, \isSealed
  for value in [42 \foo no null void]
    assert.ok (try => isSealed value; on), "accept #{typeof! value}"
    assert.same isSealed(value), on, "returns true on #{typeof! value}"
  assert.same isSealed({}), no
  if NATIVE
    assert.ok isSealed seal {}