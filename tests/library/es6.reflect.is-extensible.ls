{module, test} = QUnit
module \ES6

{defineProperty, preventExtensions} = core.Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.isExtensible' (assert)->
  {isExtensible} = core.Reflect
  assert.ok typeof! isExtensible is \Function, 'Reflect.isExtensible is function'
  assert.strictEqual isExtensible.length, 1, 'arity is 1'
  if \name of isExtensible
    assert.strictEqual isExtensible.name, \isExtensible, 'name is "isExtensible"'
  assert.ok isExtensible {}
  if MODERN
    assert.ok !isExtensible preventExtensions {}
  assert.throws (-> isExtensible 42), TypeError, 'throws on primitive'