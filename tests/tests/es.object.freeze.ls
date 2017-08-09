{module, test} = QUnit
module \ES

test 'Object.freeze' (assert)!->
  {freeze, isFrozen, keys, getOwnPropertyNames} = Object
  assert.isFunction freeze
  assert.arity freeze, 1
  assert.name freeze, \freeze
  assert.looksNative freeze
  assert.nonEnumerable Object, \freeze
  for value in [42 \foo no null void, {}]
    assert.ok (try => freeze value; on), "accept #{typeof! value}"
    assert.same freeze(value), value, "returns target on #{typeof! value}"
  if NATIVE
    assert.ok isFrozen freeze {}
  assert.arrayEqual [key for key of freeze {}], []
  assert.arrayEqual keys(freeze {}), []
  assert.arrayEqual getOwnPropertyNames(freeze {}), []
  Object?getOwnPropertySymbols and assert.arrayEqual Object.getOwnPropertySymbols(freeze {}), []
  Reflect?ownKeys and assert.arrayEqual Reflect.ownKeys(freeze {}), []