QUnit.module \ES6

eq = strictEqual

test 'Reflect.getPrototypeOf' !->
  {getPrototypeOf} = Reflect
  ok typeof! getPrototypeOf is \Function, 'Reflect.getPrototypeOf is function'
  eq getPrototypeOf.length, 1, 'arity is 1'
  ok /native code/.test(getPrototypeOf), 'looks like native'
  if \name of getPrototypeOf => eq getPrototypeOf.name, \getPrototypeOf, 'name is "getPrototypeOf"'
  eq getPrototypeOf([]), Array::
  throws (-> getPrototypeOf 42), TypeError, 'throws on primitive'