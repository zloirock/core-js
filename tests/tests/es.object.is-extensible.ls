{module, test} = QUnit
module \ES

test 'Object.isExtensible' (assert)!->
  {preventExtensions, isExtensible} = Object
  assert.isFunction isExtensible
  assert.arity isExtensible, 1
  assert.name isExtensible, \isExtensible
  assert.nonEnumerable Object, \isExtensible
  assert.looksNative isExtensible
  for value in [42 \foo no null void]
    assert.ok (try => isExtensible value; on), "accept #{typeof! value}"
    assert.same isExtensible(value), no, "returns true on #{typeof! value}"
  assert.same isExtensible({}), on
  if NATIVE
    assert.ok !isExtensible preventExtensions {}