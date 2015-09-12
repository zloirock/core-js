{module, test} = QUnit
module \ES6

test 'Reflect.getOwnPropertyDescriptor' (assert)->
  {getOwnPropertyDescriptor} = core.Reflect
  assert.ok typeof! getOwnPropertyDescriptor is \Function, 'is function'
  assert.strictEqual getOwnPropertyDescriptor.length, 2, 'arity is 2'
  if \name of getOwnPropertyDescriptor
    assert.strictEqual getOwnPropertyDescriptor.name, \getOwnPropertyDescriptor, 'name is "getOwnPropertyDescriptor"'
  obj = {baz: 789}
  desc = getOwnPropertyDescriptor obj, \baz
  assert.strictEqual desc.value, 789
  assert.throws (-> getOwnPropertyDescriptor 42 \constructor), TypeError, 'throws on primitive'