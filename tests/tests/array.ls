QUnit.module \Array
isFunction = -> typeof! it is \Function
test '::contains' !->
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
  ok Array(1)contains void
test '::turn' !->
  ok isFunction(Array::turn), 'Is function'
  (arr = [1])turn (memo, val, key, that)->
    deepEqual [] memo, 'Default memo is array'
    ok val  is 1, 'First argumert is value'
    ok key  is 0, 'Second argumert is index'
    ok that is arr, 'Third argumert is array' 
  [1]turn (memo)->
    ok memo is obj, 'Can reduce to exist object'
  , obj = {}
  deepEqual [3 2 1] [1 2 3]turn((memo, it)-> memo.unshift it), 'Reduce to object and return it'