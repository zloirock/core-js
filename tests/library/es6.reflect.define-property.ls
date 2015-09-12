{module, test} = QUnit
module \ES6

{defineProperty, getOwnPropertyDescriptor} = core.Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.defineProperty' (assert)->
  {defineProperty} = core.Reflect
  assert.ok typeof! defineProperty is \Function, 'is function'
  assert.strictEqual defineProperty.length, 3, 'arity is 3'
  if \name of defineProperty
    assert.strictEqual defineProperty.name, \defineProperty, 'name is "defineProperty"'
  O = {}
  assert.strictEqual defineProperty(O, \foo, {value: 123}), on
  assert.strictEqual O.foo, 123
  if MODERN
    O = {}
    defineProperty O, \foo, {value: 123, enumerable: on}
    assert.deepEqual getOwnPropertyDescriptor(O, \foo), {value: 123, enumerable: on, configurable: no, writable: no}
    assert.strictEqual defineProperty(O, \foo, {value: 42}), no
  assert.throws (-> defineProperty 42, \foo, {value: 42}), TypeError, 'throws on primitive'