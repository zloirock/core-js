QUnit.module 'ES6 Array.of'

deq = deepEqual

test '*' !->
  ok typeof! Array.of is \Function, 'Is function'
  deq Array.of(1), [1]
  deq Array.of(1 2 3), [1 2 3]