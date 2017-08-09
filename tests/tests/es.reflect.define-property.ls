{module, test} = QUnit
module \ES

{defineProperty, getOwnPropertyDescriptor} = Object

test 'Reflect.defineProperty' (assert)!->
  {defineProperty} = Reflect
  {create} = Reflect
  assert.isFunction defineProperty
  assert.arity defineProperty, 3
  assert.name defineProperty, \defineProperty
  assert.looksNative defineProperty
  assert.nonEnumerable Reflect, \defineProperty
  O = {}
  assert.strictEqual defineProperty(O, \foo, {value: 123}), on
  assert.strictEqual O.foo, 123
  if DESCRIPTORS
    O = {}
    defineProperty O, \foo, {value: 123, enumerable: on}
    assert.deepEqual getOwnPropertyDescriptor(O, \foo), {value: 123, enumerable: on, configurable: no, writable: no}
    assert.strictEqual defineProperty(O, \foo, {value: 42}), no
  assert.throws (!-> defineProperty 42, \foo, {value: 42}), TypeError, 'throws on primitive'
  assert.throws (!-> defineProperty 42 1 {})
  assert.throws (!-> defineProperty {} create(null), {})
  assert.throws (!-> defineProperty {} 1 1)