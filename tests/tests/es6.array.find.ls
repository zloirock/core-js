'use strict'

QUnit.module 'ES6 Array#find'

eq = strictEqual

test '*' !->
  ok typeof! Array::find is \Function, 'Is function'
  eq Array::find.length, 1, 'length is 1'
  if \name of Array::find => eq Array::find.name, \find, 'name is "find"'
  (arr = [1])find (val, key, that)->
    eq @, ctx
    eq val, 1
    eq key, 0
    eq that, arr
  , ctx = {}
  eq [1 3 NaN, 42 {}]find((is 42)), 42
  eq [1 3 NaN, 42 {}]find((is 43)), void
  if !(-> @)!
    throws (-> Array::find.call null, 0), TypeError
    throws (-> Array::find.call void, 0), TypeError
  ok \find of Array::[Symbol.unscopables], 'In Array#@@unscopables'