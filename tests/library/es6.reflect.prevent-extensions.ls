QUnit.module \ES6

{defineProperty, isExtensible} = core.Object

MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual

test 'Reflect.preventExtensions' !->
  {preventExtensions} = core.Reflect
  ok typeof! preventExtensions is \Function, 'Reflect.preventExtensions is function'
  eq preventExtensions.length, 1, 'arity is 1'
  if \name of preventExtensions => eq preventExtensions.name, \preventExtensions, 'name is "preventExtensions"'
  obj = {}
  ok preventExtensions(obj), on
  if MODERN
    ok !isExtensible obj
  throws (-> preventExtensions 42), TypeError, 'throws on primitive'