{module, test} = QUnit
module \ES6

{defineProperty, isExtensible} = core.Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.preventExtensions' (assert)->
  {preventExtensions} = core.Reflect
  assert.ok typeof! preventExtensions is \Function, 'is function'
  assert.strictEqual preventExtensions.length, 1, 'arity is 1'
  if \name of preventExtensions
    assert.strictEqual preventExtensions.name, \preventExtensions, 'name is "preventExtensions"'
  obj = {}
  assert.ok preventExtensions(obj), on
  if MODERN
    assert.ok !isExtensible obj
  assert.throws (-> preventExtensions 42), TypeError, 'throws on primitive'