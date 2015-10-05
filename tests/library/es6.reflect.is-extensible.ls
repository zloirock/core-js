{module, test} = QUnit
module \ES6

{defineProperty, preventExtensions} = core.Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.isExtensible' (assert)->
  {isExtensible} = core.Reflect
  assert.isFunction isExtensible
  assert.arity isExtensible, 1
  if \name of isExtensible
    assert.name isExtensible, \isExtensible
  assert.ok isExtensible {}
  if MODERN
    assert.ok !isExtensible preventExtensions {}
  assert.throws (-> isExtensible 42), TypeError, 'throws on primitive'