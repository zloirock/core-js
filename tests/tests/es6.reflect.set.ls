{module, test} = QUnit
module \ES6

{defineProperty, getOwnPropertyDescriptor, create} = Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.set' (assert)->
  {set} = Reflect
  assert.ok typeof! set is \Function, 'is function'
  #assert.strictEqual set.length, 3, 'arity is 3' # fails in MS Edge
  assert.ok /native code/.test(set), 'looks like native'
  assert.strictEqual set.name, \set, 'name is "set"'
  obj = {}
  assert.ok set(obj, \quux, 654), on
  assert.strictEqual obj.quux, 654
  target = {}
  receiver = {}
  set target, \foo, 1, receiver
  assert.strictEqual target.foo, void, 'target.foo === undefined'
  assert.strictEqual receiver.foo, 1, 'receiver.foo === 1'
  if MODERN
    defineProperty receiver, \bar, {value: 0, writable: on, enumerable: no, configurable: on}
    set target, \bar, 1, receiver
    assert.strictEqual receiver.bar, 1, 'receiver.bar === 1'
    assert.strictEqual getOwnPropertyDescriptor(receiver, \bar).enumerable, no, 'enumerability not overridden'
    var out
    target = create defineProperty({z:3}, \w, {set: !-> out := @}), do
      x: value: 1, writable: on, configurable: on
      y: set: !-> out := @
      c: value: 1, writable: no, configurable: no
    assert.strictEqual set(target, \x, 2, target), on, 'set x'
    assert.strictEqual target.x, 2, 'set x'
    out = null
    assert.strictEqual set(target, \y, 2, target), on, 'set y'
    assert.strictEqual out, target, 'set y'
    assert.strictEqual set(target, \z, 4, target), on
    assert.strictEqual target.z, 4, 'set z'
    out = null
    assert.strictEqual set(target, \w, 1, target), on 'set w'
    assert.strictEqual out, target, 'set w'
    assert.strictEqual set(target, \u, 0, target), on, 'set u'
    assert.strictEqual target.u, 0, 'set u'
    assert.strictEqual set(target, \c, 2, target), no, 'set c'
    assert.strictEqual target.c, 1, 'set c'
  assert.throws (-> set 42, \q, 42), TypeError, 'throws on primitive'