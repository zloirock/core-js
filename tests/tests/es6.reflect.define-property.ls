{module, test} = QUnit
module \ES6

{defineProperty, getOwnPropertyDescriptor} = Object

test 'Reflect.defineProperty' (assert)->
  {defineProperty} = Reflect
  assert.isFunction defineProperty
  assert.arity defineProperty, 3
  assert.name defineProperty, \defineProperty
  assert.looksNative defineProperty
  O = {}
  assert.strictEqual defineProperty(O, \foo, {value: 123}), on
  assert.strictEqual O.foo, 123
  if DESCRIPTORS
    O = {}
    defineProperty O, \foo, {value: 123, enumerable: on}
    assert.deepEqual getOwnPropertyDescriptor(O, \foo), {value: 123, enumerable: on, configurable: no, writable: no}
    assert.strictEqual defineProperty(O, \foo, {value: 42}), no
  assert.throws (-> defineProperty 42, \foo, {value: 42}), TypeError, 'throws on primitive'