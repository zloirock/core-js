{module, test} = QUnit
module \ES6

{defineProperty} = core.Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.deleteProperty' (assert)->
  {deleteProperty} = core.Reflect
  assert.isFunction deleteProperty
  assert.arity deleteProperty, 2
  if \name of deleteProperty
    assert.name deleteProperty, \deleteProperty
  O = {bar: 456}
  assert.strictEqual deleteProperty(O, \bar), on
  assert.ok \bar not in O
  if MODERN
    assert.strictEqual deleteProperty(defineProperty({}, \foo, {value: 42}), \foo), no
  assert.throws (-> deleteProperty 42, \foo), TypeError, 'throws on primitive'