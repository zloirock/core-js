QUnit.module 'core-js Array#turn'
isFunction = -> typeof! it is \Function
{turn} = core.Array
test '*' !->
  ok isFunction(turn), 'Is function'
  turn arr = [1], (memo, val, key, that)->
    deepEqual [] memo, 'Default memo is array'
    ok val  is 1, 'First argumert is value'
    ok key  is 0, 'Second argumert is index'
    ok that is arr, 'Third argumert is array' 
  turn [1], (memo)->
    ok memo is obj, 'Can reduce to exist object'
  , obj = {}
  deepEqual [3 2 1], turn([1 2 3], (memo, it)-> memo.unshift it), 'Reduce to object and return it'