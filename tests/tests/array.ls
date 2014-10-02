module \Array
isFunction = -> typeof! it is \Function
test '::get' !->
  ok isFunction(Array::get), 'Is function'
  ok [1 2 3]get(0)  is 1,    '[1, 2, 3].get(0) is 1'
  ok [1 2 3]get(2)  is 3,    '[1, 2, 3].get(2) is 3'
  ok [1 2 3]get(3)  is void, '[1, 2, 3].get(3) is undefined'
  ok [1 2 3]get(-1) is 3,    '[1, 2, 3].get(-1) is 3'
  ok [1 2 3]get(-3) is 1,    '[1, 2, 3].get(-3) is 1'
  ok [1 2 3]get(-4) is void, '[1, 2, 3].get(-4) is undefined'
test '::set' !->
  ok isFunction(Array::set), 'Is function'
  arr = []
  ok arr.set(0, 42) is arr
  deepEqual arr, [42]
  deepEqual [1].set(0 1).set(1 0).set(2 3).set(-2 2), [1 2 3]
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
test '::clone' !->
  ok isFunction(Array::clone), 'Is function'
  arr1 = [object1 = {q:1, w:2}, array1 = [1 2], 1 2 3]
  arr2 = arr1.clone!
  ok arr2 isnt arr1
  ok arr2\0 isnt object1
  ok arr2\1 isnt array1
  deepEqual arr1, arr2
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