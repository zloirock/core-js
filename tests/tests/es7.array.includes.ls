'use strict'

QUnit.module \ES7

test 'Array#includes' !->
  ok typeof! Array::includes is \Function, 'Is function'
  ok /native code/.test(Array::includes), 'looks like native'
  arr = [1 2 3 -0 o = {}]
  ok arr.includes 1
  ok arr.includes -0
  ok arr.includes 0
  ok arr.includes o
  ok !arr.includes 4
  ok !arr.includes -0.5
  ok !arr.includes {}
  ok Array(1)includes void
  ok [NaN].includes(NaN)
  if !(-> @)!
    throws (-> Array::includes.call null, 0), TypeError
    throws (-> Array::includes.call void, 0), TypeError
  ok \includes of Array::[Symbol.unscopables], 'In Array#@@unscopables'