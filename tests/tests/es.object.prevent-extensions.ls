{module, test} = QUnit
module \ES

test 'Object.preventExtensions' (assert)!->
  {preventExtensions, isExtensible, keys, getOwnPropertyNames} = Object
  assert.isFunction preventExtensions
  assert.arity preventExtensions, 1
  assert.name preventExtensions, \preventExtensions
  assert.looksNative preventExtensions
  assert.nonEnumerable Object, \preventExtensions
  for value in [42 \foo no null void, {}]
    assert.ok (try => preventExtensions value; on), "accept #{typeof! value}"
    assert.same preventExtensions(value), value, "returns target on #{typeof! value}"
  if NATIVE
    assert.ok isExtensible preventExtensions {}
  assert.arrayEqual [key for key of preventExtensions {}], []
  assert.arrayEqual keys(preventExtensions {}), []
  assert.arrayEqual getOwnPropertyNames(preventExtensions {}), []
  Object?getOwnPropertySymbols and assert.arrayEqual Object.getOwnPropertySymbols(preventExtensions {}), []
  Reflect?ownKeys and assert.arrayEqual Reflect.ownKeys(preventExtensions {}), []