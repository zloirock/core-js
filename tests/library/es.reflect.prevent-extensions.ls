{module, test} = QUnit
module \ES

{defineProperty, isExtensible} = core.Object

test 'Reflect.preventExtensions' (assert)!->
  {preventExtensions} = core.Reflect
  assert.isFunction preventExtensions
  assert.arity preventExtensions, 1
  if \name of preventExtensions
    assert.name preventExtensions, \preventExtensions
  obj = {}
  assert.ok preventExtensions(obj), on
  if DESCRIPTORS
    assert.ok !isExtensible obj
  assert.throws (!-> preventExtensions 42), TypeError, 'throws on primitive'