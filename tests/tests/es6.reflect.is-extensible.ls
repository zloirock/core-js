{module, test} = QUnit
module \ES6

{defineProperty, preventExtensions} = Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.isExtensible' (assert)->
  {isExtensible} = Reflect
  assert.isFunction isExtensible
  assert.arity isExtensible, 1
  assert.name isExtensible, \isExtensible
  assert.looksNative isExtensible
  assert.ok isExtensible {}
  if MODERN
    assert.ok !isExtensible preventExtensions {}
  assert.throws (-> isExtensible 42), TypeError, 'throws on primitive'