{module, test} = QUnit
module \ES6

test 'Reflect.getPrototypeOf' (assert)->
  {getPrototypeOf} = core.Reflect
  assert.ok typeof! getPrototypeOf is \Function, 'is function'
  assert.strictEqual getPrototypeOf.length, 1, 'arity is 1'
  if \name of getPrototypeOf
    assert.strictEqual getPrototypeOf.name, \getPrototypeOf, 'name is "getPrototypeOf"'
  assert.strictEqual getPrototypeOf([]), Array::
  assert.throws (-> getPrototypeOf 42), TypeError, 'throws on primitive'