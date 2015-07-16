QUnit.module \ES7

eq = strictEqual
deq = deepEqual

test 'Object.values' !->
  {values, create, assign} = Object
  ok typeof! values is \Function, 'Is function'
  ok /native code/.test(values), 'looks like native'
  eq values.length, 1, 'arity is 1'
  if \name of values => eq values.name, \values, 'name is "values"'
  deq values({q:1, w:2, e:3}), [1 2 3]
  deq values(new String \qwe), [\q \w \e]
  deq values(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6}), [4 5 6]

