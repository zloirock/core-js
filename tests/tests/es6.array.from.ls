QUnit.module 'ES6 Array.from'

eq = strictEqual
deq = deepEqual

test '*' !->
  {from} = Array
  ok typeof! from is \Function, 'Is function'
  eq Array.from.length, 1, 'length is 1'
  ok /native code/.test(Array.from), 'looks like native'
  if \name of Array.from => eq Array.from.name, \from, 'name is "from"'
  deq from(\123), <[1 2 3]>
  deq from({length: 3, 0: 1, 1: 2, 2: 3}), [1 2 3]
  from al = (-> &)(1), (val, key)->
    eq @, ctx
    eq val, 1
    eq key, 0
  , ctx = {}
  from [1], (val, key)->
    eq @, ctx
    eq val, 1
    eq key, 0
  , ctx = {}
  deq from({length: 3, 0: 1, 1: 2, 2: 3}, (^2)), [1 4 9]
  deq from(new Set [1 2 3 2 1]), [1 2 3], 'Works with iterators'
  throws (-> from null), TypeError
  throws (-> from void), TypeError
  # return #default
  done = on
  iter = [1 2 3]values!
  iter.return = -> done := no
  from iter, -> return no
  ok done, '.return #default'
  # return #throw
  done = no
  iter = [1 2 3]values!
  iter.return = -> done := on
  try => from iter, -> throw 42
  ok done, '.return #throw'
  # generic, iterable case
  F = !->
  inst = from.call F, [1, 2]
  ok inst instanceof F
  eq inst.0, 1
  eq inst.1, 2
  eq inst.length, 2
  # generic, array-like case
  inst = from.call F, {0: 1, 1: 2, length: 2}
  ok inst instanceof F
  eq inst.0, 1
  eq inst.1, 2
  eq inst.length, 2