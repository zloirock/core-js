QUnit.module \ES6

{getPrototypeOf} = core.Object

eq = strictEqual

test 'Reflect.construct' !->
  {construct} = core.Reflect
  ok typeof! construct is \Function, 'Reflect.construct is function'
  eq construct.length, 2, 'arity is 2'
  if \name of construct => eq construct.name, \construct, 'name is "construct"'
  C = (a, b, c)-> @qux = a + b + c
  eq construct(C, <[foo bar baz]>).qux, \foobarbaz, \basic
  C.apply = 42
  eq construct(C, <[foo bar baz]>).qux, \foobarbaz, 'works with redefined apply'
  inst = construct((-> @x = 42), [], Array)
  eq inst.x, 42, 'constructor with newTarget'
  ok inst instanceof Array, 'prototype with newTarget'
  throws (-> construct 42, []), TypeError, 'throws on primitive'
  f = (->)
  f:: = 42
  ok try getPrototypeOf(construct f, []) is Object::
  catch => no
  eq construct(core.Set, [[1, 2, 3, 2, 1]]).size, 3, 'works with native constructors'