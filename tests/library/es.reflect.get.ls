{module, test} = QUnit
module \ES

{defineProperty, create} = core.Object

test 'Reflect.get' (assert)!->
  {get} = core.Reflect
  assert.isFunction get
  #assert.arity get, 2 # fails in MS Edge
  if \name of get
    assert.name get, \get
  assert.strictEqual get({qux: 987}, \qux), 987
  
  if DESCRIPTORS
    target = create defineProperty({z:3}, \w, {get: -> @}), do
      x: value: 1
      y: get: -> @
    receiver = {}
    assert.strictEqual get(target, \x, receiver), 1,        'get x'
    assert.strictEqual get(target, \y, receiver), receiver, 'get y'
    assert.strictEqual get(target, \z, receiver), 3,        'get z'
    assert.strictEqual get(target, \w, receiver), receiver, 'get w'
    assert.strictEqual get(target, \u, receiver), void,     'get u'
  assert.throws (!-> get 42 \constructor), TypeError, 'throws on primitive'