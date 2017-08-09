{module, test} = QUnit
module \ES

test 'Array#find' (assert)!->
  {find} = core.Array
  assert.isFunction find
  find arr = [1], (val, key, that)!->
    assert.strictEqual @, ctx
    assert.strictEqual val, 1
    assert.strictEqual key, 0
    assert.strictEqual that, arr
  , ctx = {}
  assert.strictEqual find([1 3 NaN, 42 {}], (is 42)), 42
  assert.strictEqual find([1 3 NaN, 42 {}], (is 43)), void
  if STRICT
    assert.throws (!-> find null, 0), TypeError
    assert.throws (!-> find void, 0), TypeError