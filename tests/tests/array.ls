{isFunction} = Function
test 'Array::at' !->
  ok isFunction(Array::at), 'Array::at is function'
  ok [1 2 3]at(0)  is 1,    '[1, 2, 3].at(0) is 1'
  ok [1 2 3]at(2)  is 3,    '[1, 2, 3].at(2) is 3'
  ok [1 2 3]at(3)  is void, '[1, 2, 3].at(3) is undefined'
  ok [1 2 3]at(-1) is 3,    '[1, 2, 3].at(-1) is 3'
  ok [1 2 3]at(-3) is 1,    '[1, 2, 3].at(-3) is 1'
  ok [1 2 3]at(-4) is void, '[1, 2, 3].at(-4) is undefined'
test 'Array::pluck' !->
  ok isFunction(Array::pluck), 'Array::pluck is function'
  deepEqual [1 2 321]pluck(\length), [void void void]
  deepEqual [1 2 void]pluck(\length), [void void void]
  deepEqual <[1 2 321]>pluck(\length), [1 1 3]
test 'Array::reduceTo' !->
  ok isFunction(Array::reduceTo), 'Array::reduceTo is function'
  (arr = [1])reduceTo (val, key, that)->
    deepEqual {} @
    ok val  is 1
    ok key  is 0
    ok that is arr
  [1]reduceTo obj = {} ->
    ok @ is obj
  deepEqual [3 2 1] [1 2 3]reduceTo [] (@unshift <|)
test 'Array::merge' !->
  ok isFunction(Array::merge), 'Array::merge is function'
  arr = [1 2 3]
  ok arr is arr.merge [4 5 6]
  deepEqual arr, [1 2 3 4 5 6]
  arr = <[q w e]>
  ok arr is arr.merge \asd
  deepEqual arr, <[q w e a s d]>