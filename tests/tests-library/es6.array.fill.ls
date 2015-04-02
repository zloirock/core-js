'use strict'

QUnit.module 'ES6 Array#fill'

deq = deepEqual

test '*' !->
  {fill} = core.Array
  ok typeof! fill is \Function, 'Is function'
  strictEqual (a = fill Array(5), 5), a
  deq fill(Array(5), 5), [5 5 5 5 5]
  deq fill(Array(5), 5 1), [void 5 5 5 5]
  deq fill(Array(5), 5 1 4), [void 5 5 5 void]
  deq fill(Array(5), 5 6 1), [void void void void void]
  deq fill(Array(5), 5 -3 4), [void void 5 5 void]
  if (-> @).call(void) is void
    throws (-> fill null, 0), TypeError
    throws (-> fill void, 0), TypeError