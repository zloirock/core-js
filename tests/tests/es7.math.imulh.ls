{module, test} = QUnit
module 'ESNext'

test 'Math.imulh' (assert)!->
  {imulh} = Math
  assert.isFunction imulh
  assert.name imulh, \imulh
  assert.arity imulh, 2
  assert.looksNative imulh
  assert.nonEnumerable Math, \imulh
  assert.same imulh(0xffffffff 7), -1
  assert.same imulh(0xfffffff 77), 4
  assert.same imulh(1 7), 0
  assert.same imulh(-1 7), -1