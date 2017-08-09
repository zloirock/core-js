{module, test} = QUnit
module \ES

{defineProperty, getOwnPropertyDescriptor} = core.Object

test 'Reflect.defineProperty' (assert)!->
  {defineProperty} = core.Reflect
  {create} = core.Object
  assert.isFunction defineProperty
  assert.arity defineProperty, 3
  if \name of defineProperty
    assert.name defineProperty, \defineProperty
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