{module, test} = QUnit
module \ES

{defineProperty, preventExtensions} = Object

test 'Reflect.isExtensible' (assert)->
  {isExtensible} = Reflect
  assert.isFunction isExtensible
  assert.arity isExtensible, 1
  assert.name isExtensible, \isExtensible
  assert.looksNative isExtensible
  assert.nonEnumerable Reflect, \isExtensible
  assert.ok isExtensible {}
  if DESCRIPTORS
    assert.ok !isExtensible preventExtensions {}
  assert.throws (-> isExtensible 42), TypeError, 'throws on primitive'