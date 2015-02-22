'use strict'
strict = (-> @).call(void) is void

QUnit.module 'ES6 Array prototype'

eq = strictEqual
deq = deepEqual
isFunction = -> typeof! it is \Function

test 'Array#copyWithin' !->
  ok isFunction(Array::copyWithin), 'Is function'
  eq (a = [1]copyWithin(0)), a
  deq [1 2 3 4 5]copyWithin(0 3), [4 5 3 4 5]
  deq [1 2 3 4 5]copyWithin(1 3), [1 4 5 4 5]
  deq [1 2 3 4 5]copyWithin(1 2), [1 3 4 5 5]
  deq [1 2 3 4 5]copyWithin(2 2), [1 2 3 4 5]
  deq [1 2 3 4 5]copyWithin(0 3 4), [4 2 3 4 5]
  deq [1 2 3 4 5]copyWithin(1 3 4), [1 4 3 4 5]
  deq [1 2 3 4 5]copyWithin(1 2 4), [1 3 4 4 5]
  deq [1 2 3 4 5]copyWithin(0 -2), [4 5 3 4 5]
  deq [1 2 3 4 5]copyWithin(0 -2 -1), [4 2 3 4 5]
  deq [1 2 3 4 5]copyWithin(-4 -3 -2), [1 3 3 4 5]
  deq [1 2 3 4 5]copyWithin(-4 -3 -1), [1 3 4 4 5]
  deq [1 2 3 4 5]copyWithin(-4 -3), [1 3 4 5 5]
  if strict
    throws (-> Array::copyWithin.call null, 0), TypeError
    throws (-> Array::copyWithin.call void, 0), TypeError
  ok \copyWithin of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#fill' !->
  ok isFunction(Array::fill), 'Is function'
  eq (a = Array(5)fill(5)), a
  deq Array(5)fill(5), [5 5 5 5 5]
  deq Array(5)fill(5 1), [void 5 5 5 5]
  deq Array(5)fill(5 1 4), [void 5 5 5 void]
  deq Array(5)fill(5 6 1), [void void void void void]
  deq Array(5)fill(5 -3 4), [void void 5 5 void]
  if strict
    throws (-> Array::fill.call null, 0), TypeError
    throws (-> Array::fill.call void, 0), TypeError
  ok \fill of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#find' !->
  ok isFunction(Array::find), 'Is function'
  (arr = [1])find (val, key, that)->
    eq @, ctx
    eq val, 1
    eq key, 0
    eq that, arr
  , ctx = {}
  eq [1 3 NaN, 42 {}]find((is 42)), 42
  eq [1 3 NaN, 42 {}]find((is 43)), void
  if strict
    throws (-> Array::find.call null, 0), TypeError
    throws (-> Array::find.call void, 0), TypeError
  ok \find of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#findIndex' !->
  ok isFunction(Array::findIndex), 'Is function'
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
test 'Array#@@unscopables' !->
  eq typeof! Array::[Symbol.unscopables], \Object