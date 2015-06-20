if Object.setPrototypeOf || '__proto__' of {}
  QUnit.module 'ES6 Reflect.setPrototypeOf'

  eq = strictEqual

  test '*' !->
    {setPrototypeOf} = Reflect
    ok typeof! setPrototypeOf is \Function, 'Reflect.setPrototypeOf is function'
    eq setPrototypeOf.length, 2, 'arity is 2'
    ok /native code/.test(setPrototypeOf), 'looks like native'
    if \name of setPrototypeOf => eq setPrototypeOf.name, \setPrototypeOf, 'name is "setPrototypeOf"'
    obj = {}
    ok setPrototypeOf(obj, Array::), on
    ok obj instanceof Array
    throws (-> setPrototypeOf {}, 42), TypeError
    throws (-> setPrototypeOf 42, {}), TypeError, 'throws on primitive'
    ok setPrototypeOf(o = {}, o) is no, 'false on recursive __proto__'