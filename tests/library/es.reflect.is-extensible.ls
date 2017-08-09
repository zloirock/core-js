{module, test} = QUnit
module \ES

{defineProperty, preventExtensions} = core.Object

test 'Reflect.isExtensible' (assert)!->
  {isExtensible} = core.Reflect
  assert.isFunction isExtensible
  assert.arity isExtensible, 1
  if \name of isExtensible
    assert.name isExtensible, \isExtensible
  assert.ok isExtensible {}
  if DESCRIPTORS
    assert.ok !isExtensible preventExtensions {}
  assert.throws (!-> isExtensible 42), TypeError, 'throws on primitive'