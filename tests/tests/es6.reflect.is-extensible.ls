{module, test} = QUnit
module \ES6

{defineProperty, preventExtensions} = Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.isExtensible' (assert)->
  {isExtensible} = Reflect
  assert.ok typeof! isExtensible is \Function, 'Reflect.isExtensible is function'
  assert.strictEqual isExtensible.length, 1, 'arity is 1'
  assert.ok /native code/.test(isExtensible), 'looks like native'
  assert.strictEqual isExtensible.name, \isExtensible, 'name is "isExtensible"'
  assert.ok isExtensible {}
  if MODERN
    assert.ok !isExtensible preventExtensions {}
  assert.throws (-> isExtensible 42), TypeError, 'throws on primitive'