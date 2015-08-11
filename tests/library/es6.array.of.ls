QUnit.module \ES6

eq = strictEqual
deq = deepEqual

test 'Array.of' !->
  ok typeof! core.Array.of is \Function, 'Is function'
  eq core.Array.of.length, 0, 'length is 0'
  if \name of core.Array.of => eq core.Array.of.name, \of, 'name is "of"'
  deq core.Array.of(1), [1]
  deq core.Array.of(1 2 3), [1 2 3]
  # generic
  F = !->
  inst = core.Array.of.call F, 1, 2
  ok inst instanceof F
  eq inst.0, 1
  eq inst.1, 2
  eq inst.length, 2