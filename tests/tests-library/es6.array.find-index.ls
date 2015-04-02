'use strict'
strict = (-> @).call(void) is void

QUnit.module 'ES6 Array#findIndex'

eq = strictEqual

test '*' !->
  {findIndex} = core.Array
  ok typeof! findIndex is \Function, 'Is function'
  findIndex arr = [1], (val, key, that)->
    eq @, ctx
    eq val, 1
    eq key, 0
    eq that, arr
  , ctx = {}
  eq findIndex([1 3 NaN, 42 {}], (is 42)), 3
  if strict
    throws (-> findIndex null, 0), TypeError
    throws (-> findIndex void, 0), TypeError