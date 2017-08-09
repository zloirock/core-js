{module, test} = QUnit
module \ES

{defineProperty} = Object

test 'Reflect.deleteProperty' (assert)->
  {deleteProperty} = Reflect
  assert.isFunction deleteProperty
  assert.arity deleteProperty, 2
  assert.name deleteProperty, \deleteProperty
  assert.looksNative deleteProperty
  assert.nonEnumerable Reflect, \deleteProperty
  O = {bar: 456}
  assert.strictEqual deleteProperty(O, \bar), on
  assert.ok \bar not in O
  if DESCRIPTORS
    assert.strictEqual deleteProperty(defineProperty({}, \foo, {value: 42}), \foo), no
  assert.throws (-> deleteProperty 42, \foo), TypeError, 'throws on primitive'