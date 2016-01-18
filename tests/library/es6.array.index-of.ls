{module, test} = QUnit
module \ES6

test 'Array#indexOf' (assert)!->
  {indexOf} = core.Array
  assert.isFunction indexOf
  assert.ok 0  is indexOf [1 1 1], 1
  assert.ok -1 is indexOf [1 2 3], 1 1
  assert.ok 1  is indexOf [1 2 3], 2 1
  assert.ok -1 is indexOf [1 2 3], 2 -1
  assert.ok 1  is indexOf [1 2 3], 2 -2
  assert.ok -1 is indexOf [NaN], NaN
  assert.ok 3  is indexOf Array(2)concat([1 2 3]), 2
  assert.ok -1 is indexOf Array(1), void
  if STRICT
    assert.throws (!-> indexOf null, 0), TypeError
    assert.throws (!-> indexOf void, 0), TypeError