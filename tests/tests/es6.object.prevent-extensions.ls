{module, test} = QUnit
module \ES6

test 'Object.preventExtensions' (assert)!->
  {preventExtensions, isExtensible, keys, getOwnPropertyNames, getOwnPropertySymbols} = Object
  {ownKeys} = Reflect
  assert.isFunction preventExtensions
  assert.arity preventExtensions, 1
  assert.name preventExtensions, \preventExtensions
  assert.looksNative preventExtensions
  for value in [42 \foo no null void, {}]
    assert.ok (try => preventExtensions value; on), "accept #{typeof! value}"
    assert.same preventExtensions(value), value, "returns target on #{typeof! value}"
  if NATIVE
    assert.ok isExtensible preventExtensions {}
  assert.arrayEqual [key for key of preventExtensions {}], []
  assert.arrayEqual keys(preventExtensions {}), []
  assert.arrayEqual getOwnPropertyNames(preventExtensions {}), []
  assert.arrayEqual getOwnPropertySymbols(preventExtensions {}), []
  assert.arrayEqual ownKeys(preventExtensions {}), []