QUnit.module \ES6

{defineProperty, preventExtensions} = core.Object

MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual

test 'Reflect.isExtensible' !->
  {isExtensible} = core.Reflect
  ok typeof! isExtensible is \Function, 'Reflect.isExtensible is function'
  eq isExtensible.length, 1, 'arity is 1'
  if \name of isExtensible => eq isExtensible.name, \isExtensible, 'name is "isExtensible"'
  ok isExtensible {}
  if MODERN
    ok !isExtensible preventExtensions {}
  throws (-> isExtensible 42), TypeError, 'throws on primitive'