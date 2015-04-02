'use strict'

QUnit.module 'ES7 Array#includes'

test '*' !->
  {includes} = core.Array
  ok typeof! includes is \Function, 'Is function'
  arr = [1 2 3 -0 o = {}]
  ok includes arr, 1
  ok includes arr, -0
  ok includes arr, 0
  ok includes arr, o
  ok !includes arr, 4
  ok !includes arr, -0.5
  ok !includes arr, {}
  ok includes Array(1), void
  ok includes [NaN], NaN
  if typeof (-> @).call(void) is \undefined
    throws (-> includes null, 0), TypeError
    throws (-> includes void, 0), TypeError