{module, test} = QUnit
module \ES

{defineProperty} = core.Object

test 'Reflect.deleteProperty' (assert)!->
  {deleteProperty} = core.Reflect
  assert.isFunction deleteProperty
  assert.arity deleteProperty, 2
  if \name of deleteProperty
    assert.name deleteProperty, \deleteProperty
  O = {bar: 456}
  assert.strictEqual deleteProperty(O, \bar), on
  assert.ok \bar not in O
  if DESCRIPTORS
    assert.strictEqual deleteProperty(defineProperty({}, \foo, {value: 42}), \foo), no
  assert.throws (!-> deleteProperty 42, \foo), TypeError, 'throws on primitive'