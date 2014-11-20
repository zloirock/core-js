QUnit.module \Array
isFunction = -> typeof! it is \Function
test '::includes' !->
  ok isFunction(Array::includes), 'Is function'
  arr = [1 2 3 -0 NaN, o = {}]
  ok arr.includes 1
  ok arr.includes -0
  ok arr.includes 0
  ok arr.includes o
  ok !arr.includes 4
  ok !arr.includes -0.5
  ok !arr.includes {}
  ok Array(1)includes void
  ok [NaN].includes(NaN)
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