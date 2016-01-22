{module, test} = QUnit
module \ES6

test 'Array#lastIndexOf' (assert)!->
  {lastIndexOf} = core.Array
  assert.isFunction lastIndexOf
  assert.strictEqual 2,  lastIndexOf [1 1 1], 1
  assert.strictEqual -1, lastIndexOf [1 2 3], 3 1
  assert.strictEqual 1,  lastIndexOf [1 2 3], 2 1
  assert.strictEqual -1, lastIndexOf [1 2 3], 2 -3
  assert.strictEqual -1, lastIndexOf [1 2 3], 1, -4
  assert.strictEqual 1,  lastIndexOf [1 2 3], 2 -2
  assert.strictEqual -1, lastIndexOf [NaN], NaN
  assert.strictEqual 1,  lastIndexOf [1 2 3]concat(Array 2), 2
  if STRICT
    assert.throws (!-> lastIndexOf null, 0), TypeError
    assert.throws (!-> lastIndexOf void, 0), TypeError