{module, test} = QUnit
module \ES6

test 'Object.seal' (assert)!->
  {seal, isSealed, keys, getOwnPropertyNames, getOwnPropertySymbols} = Object
  assert.isFunction seal
  assert.arity seal, 1
  assert.name seal, \seal
  assert.looksNative seal
  for value in [42 \foo no null void, {}]
    assert.ok (try => seal value; on), "accept #{typeof! value}"
    assert.same seal(value), value, "returns target on #{typeof! value}"
  if NATIVE
    assert.ok isSealed seal {}
  assert.arrayEqual [key for key of seal {}], []
  assert.arrayEqual keys(seal {}), []
  assert.arrayEqual getOwnPropertyNames(seal {}), []
  assert.arrayEqual getOwnPropertySymbols(seal {}), []
  Reflect?ownKeys and assert.arrayEqual Reflect.ownKeys(seal {}), []