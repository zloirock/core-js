QUnit.module \ES6

eq = strictEqual

test 'Reflect.getOwnPropertyDescriptor' !->
  {getOwnPropertyDescriptor} = core.Reflect
  ok typeof! getOwnPropertyDescriptor is \Function, 'Reflect.getOwnPropertyDescriptor is function'
  eq getOwnPropertyDescriptor.length, 2, 'arity is 2'
  if \name of getOwnPropertyDescriptor => eq getOwnPropertyDescriptor.name, \getOwnPropertyDescriptor, 'name is "getOwnPropertyDescriptor"'
  obj = {baz: 789}
  desc = getOwnPropertyDescriptor obj, \baz
  eq desc.value, 789
  throws (-> getOwnPropertyDescriptor 42 \constructor), TypeError, 'throws on primitive'