'use strict'

QUnit.module 'ES6 Array#fill'

deq = deepEqual

test '*' !->
  ok typeof! Array::fill is \Function, 'Is function'
  strictEqual (a = Array(5)fill(5)), a
  deq Array(5)fill(5), [5 5 5 5 5]
  deq Array(5)fill(5 1), [void 5 5 5 5]
  deq Array(5)fill(5 1 4), [void 5 5 5 void]
  deq Array(5)fill(5 6 1), [void void void void void]
  deq Array(5)fill(5 -3 4), [void void 5 5 void]
  if (-> @).call(void) is void
    throws (-> Array::fill.call null, 0), TypeError
    throws (-> Array::fill.call void, 0), TypeError
  ok \fill of Array::[Symbol.unscopables], 'In Array#@@unscopables'