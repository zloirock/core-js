QUnit.module 'ES6 Array.of'

deq = deepEqual

test '*' !->
  ok typeof! core.Array.of is \Function, 'Is function'
  deq core.Array.of(1), [1]
  deq core.Array.of(1 2 3), [1 2 3]