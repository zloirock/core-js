QUnit.module 'ES6 Array statics'

eq = strictEqual
deq = deepEqual
isFunction = -> typeof! it is \Function

test 'Array.from' !->
  {from} = Array
  ok isFunction(from), 'Is function'
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
test 'Array.of' !->
  ok isFunction(Array.of), 'Is function'
  deq Array.of(1), [1]
  deq Array.of(1 2 3), [1 2 3]