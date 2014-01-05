{isFunction} = Object
test 'Array::at' !->
  ok isFunction Array::at
  ok [1 2 3]at(0)  is 1
  ok [1 2 3]at(2)  is 3
  ok [1 2 3]at(3)  is void
  ok [1 2 3]at(-1) is 3
  ok [1 2 3]at(-3) is 1
  ok [1 2 3]at(-4) is void
test 'Array::props' !->
  ok isFunction Array::props
  deepEqual [1 2 321]props(\length), [void void void]
  deepEqual [1 2 void]props(\length), [void void void]
  deepEqual <[1 2 321]>props(\length), [1 1 3]
test 'Array::reduceTo' !->
  ok isFunction Array::reduceTo
  (arr = [1])reduceTo (val, key, that)->
    deepEqual {} @
    ok val  is 1
    ok key  is 0
    ok that is arr
  [1]reduceTo ->
    ok @ is obj
  , obj = {}
  deepEqual [3 2 1] [1 2 3]reduceTo (@unshift <|), []
test 'Array::indexSame' !->
  ok isFunction Array::indexSame
  ok [1 2 3 4 3 2 1]indexSame(3) is 2
  ok [1, NaN, 3]indexSame(NaN)   is 1
  ok [0, -0, 42]indexSame(-0)    is 1
test 'Array::merge' !->
  ok isFunction Array::merge
  arr = [1 2 3]
  ok arr is arr.merge [4 5 6]
  deepEqual arr, [1 2 3 4 5 6]
  arr = <[q w e]>
  ok arr is arr.merge \asd
  deepEqual arr, <[q w e a s d]>
test 'Array::sum' !->
  ok isFunction Array::sum
  ok [1 2 3]sum! is 6
  ok Object.is [\1 \2 3]sum(\length), NaN
  ok <[1 22 333]>sum(\length) is 6
test 'Array::avg' !->
  ok isFunction Array::avg
  ok [1 2 3]avg! is 2
  ok Object.is [\1 \22 3]avg(\length), NaN
  ok <[1 22 333]>avg(\length) is 2
test 'Array::min' !->
  ok isFunction Array::min
  ok []min! is Infinity
  ok [1 2 3 2 1]min! is 1
  ok <[1 22 333]>min(\length) is 1
test 'Array::max' !->
  ok isFunction Array::max
  ok []max! is -Infinity
  ok [1 2 3 2 1]max! is 3
  ok <[1 22 333]>max(\length) is 3
test 'Array::unique' !->
  ok isFunction Array::unique
  deepEqual [1 2 3 2 1]unique!, [1 2 3]
test 'Array::cross' !->
  ok isFunction Array::cross
  deepEqual [1 2 3 2 1]cross([2 5 7 1]), [1 2]
  deepEqual <[1 2 3 2 1]>cross(\2571), <[1 2]>
  deepEqual [1 2 3 2 1]cross((-> &)(2 5 7 1)), [1 2]