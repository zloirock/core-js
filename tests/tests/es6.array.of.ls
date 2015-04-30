QUnit.module 'ES6 Array.of'

deq = deepEqual
eq = strictEqual

test '*' !->
  ok typeof! Array.of is \Function, 'Is function'
  eq Array.of.length, 0, 'length is 0'
  if \name of Array.of => eq Array.of.name, \of, 'name is "of"'
  deq Array.of(1), [1]
  deq Array.of(1 2 3), [1 2 3]