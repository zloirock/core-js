QUnit.module 'ES6 Array.from'

eq = strictEqual
deq = deepEqual

test '*' !->
  {from} = Array
  ok typeof! from is \Function, 'Is function'
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