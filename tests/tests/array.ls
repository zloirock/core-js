isFunction = -> typeof! it is \Function
test 'Array::get' !->
  ok isFunction(Array::get), 'Is function'
  ok [1 2 3]get(0)  is 1,    '[1, 2, 3].get(0) is 1'
  ok [1 2 3]get(2)  is 3,    '[1, 2, 3].get(2) is 3'
  ok [1 2 3]get(3)  is void, '[1, 2, 3].get(3) is undefined'
  ok [1 2 3]get(-1) is 3,    '[1, 2, 3].get(-1) is 3'
  ok [1 2 3]get(-3) is 1,    '[1, 2, 3].get(-3) is 1'
  ok [1 2 3]get(-4) is void, '[1, 2, 3].get(-4) is undefined'
test 'Array::transform' !->
  ok isFunction(Array::transform), 'Is function'
  (arr = [1])transform (memo, val, key, that)->
    deepEqual [] memo, 'Default memo is array'
    ok val  is 1, 'First argumert is value'
    ok key  is 0, 'Second argumert is index'
    ok that is arr, 'Third argumert is array' 
  [1]transform (memo)->
    ok memo is obj, 'Can reduce to exist object'
  , obj = {}
  deepEqual [3 2 1] [1 2 3]transform((memo, it)-> memo.unshift it), 'Reduce to object and return it'
test 'Array::contains' !->
  ok isFunction(Array::contains), 'Is function'
  arr = [1 2 3 -0 NaN, o = {}]
  ok arr.contains 1
  ok arr.contains -0
  ok arr.contains 0
  ok arr.contains NaN
  ok arr.contains o
  ok !arr.contains 4
  ok !arr.contains -0.5
  ok !arr.contains {}