{module, test} = QUnit
module \ES6

test 'Reflect.getOwnPropertyDescriptor' (assert)->
  {getOwnPropertyDescriptor} = Reflect
  assert.ok typeof! getOwnPropertyDescriptor is \Function, 'is function'
  assert.strictEqual getOwnPropertyDescriptor.length, 2, 'arity is 2'
  assert.ok /native code/.test(getOwnPropertyDescriptor), 'looks like native'
  assert.strictEqual getOwnPropertyDescriptor.name, \getOwnPropertyDescriptor, 'name is "getOwnPropertyDescriptor"'
  obj = {baz: 789}
  desc = getOwnPropertyDescriptor obj, \baz
  assert.strictEqual desc.value, 789
  assert.throws (-> getOwnPropertyDescriptor 42 \constructor), TypeError, 'throws on primitive'