'use strict'

QUnit.module \ES6

eq = strictEqual

test 'Array#find' !->
  {find} = core.Array
  ok typeof! find is \Function, 'Is function'
  find arr = [1], (val, key, that)->
    eq @, ctx
    eq val, 1
    eq key, 0
    eq that, arr
  , ctx = {}
  eq find([1 3 NaN, 42 {}], (is 42)), 42
  eq find([1 3 NaN, 42 {}], (is 43)), void
  if !(-> @)!
    throws (-> find null, 0), TypeError
    throws (-> find void, 0), TypeError