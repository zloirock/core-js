if Object.setPrototypeOf || '__proto__' of {}
  {module, test} = QUnit
  module \ES6

  test 'Reflect.setPrototypeOf' (assert)->
    {setPrototypeOf} = Reflect
    assert.ok typeof! setPrototypeOf is \Function, 'Reflect.setPrototypeOf is function'
    #assert.strictEqual setPrototypeOf.length, 2, 'arity is 2' # fails in MS Edge
    assert.ok /native code/.test(setPrototypeOf), 'looks like native'
    assert.strictEqual setPrototypeOf.name, \setPrototypeOf, 'name is "setPrototypeOf"'
    obj = {}
    assert.ok setPrototypeOf(obj, Array::), on
    assert.ok obj instanceof Array
    assert.throws (-> setPrototypeOf {}, 42), TypeError
    assert.throws (-> setPrototypeOf 42, {}), TypeError, 'throws on primitive'
    assert.ok setPrototypeOf(o = {}, o) is no, 'false on recursive __proto__'