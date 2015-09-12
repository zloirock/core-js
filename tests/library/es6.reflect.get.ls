{module, test} = QUnit
module \ES6

{defineProperty, create} = core.Object
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.get' (assert)->
  {get} = core.Reflect
  assert.ok typeof! get is \Function, 'is function'
  #eq get.length, 2, 'arity is 2' # fails in MS Edge
  if \name of get
    assert.strictEqual get.name, \get, 'name is "get"'
  assert.strictEqual get({qux: 987}, \qux), 987
  
  if MODERN
    target = create defineProperty({z:3}, \w, {get: -> @}), do
      x: value: 1
      y: get: -> @
    receiver = {}
    assert.strictEqual get(target, \x, receiver), 1,        'get x'
    assert.strictEqual get(target, \y, receiver), receiver, 'get y'
    assert.strictEqual get(target, \z, receiver), 3,        'get z'
    assert.strictEqual get(target, \w, receiver), receiver, 'get w'
    assert.strictEqual get(target, \u, receiver), void,     'get u'
  assert.throws (-> get 42 \constructor), TypeError, 'throws on primitive'