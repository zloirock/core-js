{module, test} = QUnit
module \ES6

{defineProperty, isExtensible} = Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.preventExtensions' (assert)->
  {preventExtensions} = Reflect
  assert.ok typeof! preventExtensions is \Function, 'Reflect.preventExtensions is function'
  assert.strictEqual preventExtensions.length, 1, 'arity is 1'
  assert.ok /native code/.test(preventExtensions), 'looks like native'
  assert.strictEqual preventExtensions.name, \preventExtensions, 'name is "preventExtensions"'
  obj = {}
  assert.ok preventExtensions(obj), on
  if MODERN
    assert.ok !isExtensible obj
  assert.throws (-> preventExtensions 42), TypeError, 'throws on primitive'