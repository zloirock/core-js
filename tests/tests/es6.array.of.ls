QUnit.module 'ES6 Array.of'

deq = deepEqual
eq = strictEqual

test '*' !->
  ok typeof! Array.of is \Function, 'Is function'
  eq Array.of.length, 0, 'length is 0'
  if \name of Array.of => eq Array.of.name, \of, 'name is "of"'
  deq Array.of(1), [1]
  deq Array.of(1 2 3), [1 2 3]
  # generic
  F = !->
  inst = Array.of.call F, 1, 2
  ok inst instanceof F
  eq inst.0, 1
  eq inst.1, 2
  eq inst.length, 2