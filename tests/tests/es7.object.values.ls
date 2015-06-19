QUnit.module 'ES7 Object.values'

deq = deepEqual

test '*' !->
  {values, create, assign} = Object
  ok typeof! values is \Function, 'Is function'
  ok /native code/.test(values), 'looks like native'
  deq values({q:1, w:2, e:3}), [1 2 3]
  deq values(new String \qwe), [\q \w \e]
  deq values(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6}), [4 5 6]

