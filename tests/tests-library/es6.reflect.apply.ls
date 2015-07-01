QUnit.module \ES6

eq = strictEqual

test 'Reflect.apply' !->
  {apply} = core.Reflect
  ok typeof! apply is \Function, 'Reflect.apply is function'
  eq apply.length, 3, 'arity is 3'
  if \name of apply => eq apply.name, \apply, 'name is "apply"'
  eq apply(Array::push, [1 2], [3 4 5]), 5
  C = (a, b, c)-> a + b + c
  C.apply = 42
  eq apply(C, null, <[foo bar baz]>), \foobarbaz, 'works with redefined apply'
  throws (-> apply 42, null, []), TypeError, 'throws on primitive'