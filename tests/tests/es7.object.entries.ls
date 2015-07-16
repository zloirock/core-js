QUnit.module \ES7

eq = strictEqual
deq = deepEqual

test 'Object.entries' !->
  {entries, create, assign} = Object
  ok typeof! entries is \Function, 'Is function'
  ok /native code/.test(entries), 'looks like native'
  eq entries.length, 1, 'arity is 1'
  if \name of entries => eq entries.name, \entries, 'name is "entries"'
  deq entries({q:1, w:2, e:3}), [[\q 1] [\w 2] [\e 3]]
  deq entries(new String \qwe), [[\0 \q] [\1 \w] [\2 \e]]
  deq entries(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6}), [[\a 4] [\s 5] [\d 6]]