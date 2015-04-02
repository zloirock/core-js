QUnit.module 'core-js Number'
isFunction = -> typeof! it is \Function

test '#random' !->
  {random} = core.Number
  {every} = core.Array
  ok isFunction(random), 'Is function'
  ok every [random 10 for til 100], -> 0 <= it <= 10
  ok every [random 10 7 for til 100], -> 7 <= it <= 10
  ok every [random 7 10 for til 100], -> 7 <= it <= 10