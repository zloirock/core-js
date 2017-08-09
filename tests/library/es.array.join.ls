{module, test} = QUnit
module \ES

test 'Array#join' (assert)!->
  {join} = core.Array
  assert.isFunction join
  assert.strictEqual join([1 2 3] void), '1,2,3'
  assert.strictEqual join(\123), '1,2,3'
  assert.strictEqual join(\123 \|), '1|2|3'
  if STRICT
    assert.throws (!-> join null), TypeError
    assert.throws (!-> join void), TypeError