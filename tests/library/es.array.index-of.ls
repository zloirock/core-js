{module, test} = QUnit
module \ES

test 'Array#indexOf' (assert)!->
  {indexOf} = core.Array
  assert.isFunction indexOf
  assert.same 0,  indexOf [1 1 1], 1
  assert.same -1, indexOf [1 2 3], 1 1
  assert.same 1,  indexOf [1 2 3], 2 1
  assert.same -1, indexOf [1 2 3], 2 -1
  assert.same 1,  indexOf [1 2 3], 2 -2
  assert.same -1, indexOf [NaN], NaN
  assert.same 3,  indexOf Array(2)concat([1 2 3]), 2
  assert.same -1, indexOf Array(1), void
  assert.same 0,  indexOf([1], 1, -0), "shouldn't return negative zero"
  if STRICT
    assert.throws (!-> indexOf null, 0), TypeError
    assert.throws (!-> indexOf void, 0), TypeError