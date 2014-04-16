isFunction = -> typeof! it is \Function
test 'Array::at' !->
  ok isFunction(Array::at), 'Is function'
  ok [1 2 3]at(0)  is 1,    '[1, 2, 3].at(0) is 1'
  ok [1 2 3]at(2)  is 3,    '[1, 2, 3].at(2) is 3'
  ok [1 2 3]at(3)  is void, '[1, 2, 3].at(3) is undefined'
  ok [1 2 3]at(-1) is 3,    '[1, 2, 3].at(-1) is 3'
  ok [1 2 3]at(-3) is 1,    '[1, 2, 3].at(-3) is 1'
  ok [1 2 3]at(-4) is void, '[1, 2, 3].at(-4) is undefined'
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