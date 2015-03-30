'use strict'
strict = (-> @).call(void) is void

QUnit.module 'ES6 Array#findIndex'

eq = strictEqual

test '*' !->
  ok typeof! Array::findIndex is \Function, 'Is function'
  (arr = [1])findIndex (val, key, that)->
    eq @, ctx
    eq val, 1
    eq key, 0
    eq that, arr
  , ctx = {}
  eq [1 3 NaN, 42 {}]findIndex((is 42)), 3
  if strict
    throws (-> Array::findIndex.call null, 0), TypeError
    throws (-> Array::findIndex.call void, 0), TypeError
  ok \findIndex of Array::[Symbol.unscopables], 'In Array#@@unscopables'