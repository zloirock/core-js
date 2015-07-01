QUnit.module \ES7

deq = deepEqual

test 'Object.entries' !->
  {entries, create, assign} = core.Object
  ok typeof! entries is \Function, 'Is function'
  deq entries({q:1, w:2, e:3}), [[\q 1] [\w 2] [\e 3]]
  deq entries(new String \qwe), [[\0 \q] [\1 \w] [\2 \e]]
  deq entries(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6}), [[\a 4] [\s 5] [\d 6]]