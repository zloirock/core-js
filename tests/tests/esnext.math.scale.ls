{module, test} = QUnit
module \ESNext

test 'Math.scale' (assert)!->
  {scale} = Math
  assert.isFunction scale
  assert.name scale, \scale
  assert.arity scale, 5
  assert.looksNative scale
  assert.nonEnumerable Math, \scale
  assert.same scale(3 1 2 1 2), 3
  assert.same scale(0 3 5 8 10), 5
  assert.same scale(1 1 1 1 1), NaN
  assert.same scale(-1 -1 -1 -1 -1 ), NaN
  