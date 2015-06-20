QUnit.module 'ES6 Reflect.getPrototypeOf'

eq = strictEqual

test '*' !->
  {getPrototypeOf} = core.Reflect
  ok typeof! getPrototypeOf is \Function, 'Reflect.getPrototypeOf is function'
  eq getPrototypeOf.length, 1, 'arity is 1'
  if \name of getPrototypeOf => eq getPrototypeOf.name, \getPrototypeOf, 'name is "getPrototypeOf"'
  eq getPrototypeOf([]), Array::
  throws (-> getPrototypeOf 42), TypeError, 'throws on primitive'