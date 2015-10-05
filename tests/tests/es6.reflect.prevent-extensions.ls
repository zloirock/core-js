{module, test} = QUnit
module \ES6

{defineProperty, isExtensible} = Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.preventExtensions' (assert)->
  {preventExtensions} = Reflect
  assert.isFunction preventExtensions
  assert.arity preventExtensions, 1
  assert.name preventExtensions, \preventExtensions
  assert.looksNative preventExtensions
  obj = {}
  assert.ok preventExtensions(obj), on
  if MODERN
    assert.ok !isExtensible obj
  assert.throws (-> preventExtensions 42), TypeError, 'throws on primitive'