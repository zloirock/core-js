{module, test} = QUnit
module \ES

test 'Reflect.getPrototypeOf' (assert)->
  {getPrototypeOf} = Reflect
  assert.isFunction getPrototypeOf
  assert.arity getPrototypeOf, 1
  assert.name getPrototypeOf, \getPrototypeOf
  assert.looksNative getPrototypeOf
  assert.nonEnumerable Reflect, \getPrototypeOf
  assert.strictEqual getPrototypeOf([]), Array::
  assert.throws (-> getPrototypeOf 42), TypeError, 'throws on primitive'