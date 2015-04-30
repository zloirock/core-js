QUnit.module 'ES6 Array.of'

eq = strictEqual
deq = deepEqual

test '*' !->
  ok typeof! core.Array.of is \Function, 'Is function'
  eq core.Array.of.length, 0, 'length is 0'
  if \name of core.Array.of => eq core.Array.of.name, \of, 'name is "of"'
  deq core.Array.of(1), [1]
  deq core.Array.of(1 2 3), [1 2 3]