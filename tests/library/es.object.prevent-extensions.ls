{module, test} = QUnit
module \ES

test 'Object.preventExtensions' (assert)!->
  {preventExtensions, keys, getOwnPropertyNames, getOwnPropertySymbols} = core.Object
  {ownKeys} = core.Reflect
  assert.isFunction preventExtensions
  assert.arity preventExtensions, 1
  for value in [42 \foo no null void, {}]
    assert.ok (try => preventExtensions value; on), "accept #{typeof! value}"
    assert.same preventExtensions(value), value, "returns target on #{typeof! value}"
  assert.arrayEqual [key for key of preventExtensions {}], []
  assert.arrayEqual keys(preventExtensions {}), []
  assert.arrayEqual getOwnPropertyNames(preventExtensions {}), []
  assert.arrayEqual getOwnPropertySymbols(preventExtensions {}), []
  assert.arrayEqual ownKeys(preventExtensions {}), []