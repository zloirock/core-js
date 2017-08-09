{module, test} = QUnit
module \ES

test 'Reflect.getOwnPropertyDescriptor' (assert)->
  {getOwnPropertyDescriptor} = Reflect
  assert.isFunction getOwnPropertyDescriptor
  assert.arity getOwnPropertyDescriptor, 2
  assert.name getOwnPropertyDescriptor, \getOwnPropertyDescriptor
  assert.looksNative getOwnPropertyDescriptor
  assert.nonEnumerable Reflect, \getOwnPropertyDescriptor
  obj = {baz: 789}
  desc = getOwnPropertyDescriptor obj, \baz
  assert.strictEqual desc.value, 789
  assert.throws (-> getOwnPropertyDescriptor 42 \constructor), TypeError, 'throws on primitive'