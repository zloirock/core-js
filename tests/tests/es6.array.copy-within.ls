'use strict'
QUnit.module \ES6

deq = deepEqual
eq = strictEqual

test 'Array#copyWithin' !->
  ok typeof! Array::copyWithin is \Function, 'Is function'
  eq Array::copyWithin.length, 2, 'length is 2'
  ok /native code/.test(Array::copyWithin), 'looks like native'
  if \name of Array::copyWithin => eq Array::copyWithin.name, \copyWithin, 'name is "copyWithin"'
  strictEqual (a = [1]copyWithin(0)), a
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
  if !(-> @)!
    throws (-> Array::copyWithin.call null, 0), TypeError
    throws (-> Array::copyWithin.call void, 0), TypeError
  ok \copyWithin of Array::[Symbol.unscopables], 'In Array#@@unscopables'