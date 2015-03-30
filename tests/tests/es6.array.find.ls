'use strict'

QUnit.module 'ES6 Array#find'

eq = strictEqual

test '*' !->
  ok typeof! Array::find is \Function, 'Is function'
  (arr = [1])find (val, key, that)->
    eq @, ctx
    eq val, 1
    eq key, 0
    eq that, arr
  , ctx = {}
  eq [1 3 NaN, 42 {}]find((is 42)), 42
  eq [1 3 NaN, 42 {}]find((is 43)), void
  if (-> @).call(void) is void
    throws (-> Array::find.call null, 0), TypeError
    throws (-> Array::find.call void, 0), TypeError
  ok \find of Array::[Symbol.unscopables], 'In Array#@@unscopables'