QUnit.module \ES7

isFunction = -> typeof! it is \Function

deq = deepEqual
{create, assign} = Object

test 'Object.values' !->
  {values} = Object
  ok isFunction(values), 'Is function'
  deq values({q:1, w:2, e:3}), [1 2 3]
  deq values(new String \qwe), [\q \w \e]
  deq values(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6}), [4 5 6]

test 'Object.entries' !->
  {entries} = Object
  ok isFunction(entries), 'Is function'
  deq entries({q:1, w:2, e:3}), [[\q 1] [\w 2] [\e 3]]
  deq entries(new String \qwe), [[\0 \q] [\1 \w] [\2 \e]]
  deq entries(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6}), [[\a 4] [\s 5] [\d 6]]