if PROTO
  {module, test} = QUnit
  module \ES

  test 'Reflect.setPrototypeOf' (assert)->
    {setPrototypeOf} = Reflect
    assert.isFunction setPrototypeOf
    NATIVE and assert.arity setPrototypeOf, 2 # fails in MS Edge
    assert.name setPrototypeOf, \setPrototypeOf
    assert.looksNative setPrototypeOf
    assert.nonEnumerable Reflect, \setPrototypeOf
    obj = {}
    assert.ok setPrototypeOf(obj, Array::), on
    assert.ok obj instanceof Array
    assert.throws (-> setPrototypeOf {}, 42), TypeError
    assert.throws (-> setPrototypeOf 42, {}), TypeError, 'throws on primitive'
    assert.ok setPrototypeOf(o = {}, o) is no, 'false on recursive __proto__'