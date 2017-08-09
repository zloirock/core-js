{module, test} = QUnit
module \ES

test 'Reflect.getPrototypeOf' (assert)!->
  {getPrototypeOf} = core.Reflect
  assert.isFunction getPrototypeOf
  assert.arity getPrototypeOf, 1
  if \name of getPrototypeOf
    assert.name getPrototypeOf, \getPrototypeOf
  assert.strictEqual getPrototypeOf([]), Array::
  assert.throws (!-> getPrototypeOf 42), TypeError, 'throws on primitive'