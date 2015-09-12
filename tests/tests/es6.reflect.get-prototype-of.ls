{module, test} = QUnit
module \ES6

test 'Reflect.getPrototypeOf' (assert)->
  {getPrototypeOf} = Reflect
  assert.ok typeof! getPrototypeOf is \Function, 'Reflect.getPrototypeOf is function'
  assert.strictEqual getPrototypeOf.length, 1, 'arity is 1'
  assert.ok /native code/.test(getPrototypeOf), 'looks like native'
  assert.strictEqual getPrototypeOf.name, \getPrototypeOf, 'name is "getPrototypeOf"'
  assert.strictEqual getPrototypeOf([]), Array::
  assert.throws (-> getPrototypeOf 42), TypeError, 'throws on primitive'