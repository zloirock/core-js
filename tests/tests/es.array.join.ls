{module, test} = QUnit
module \ES

test 'Array#join' (assert)!->
  assert.isFunction Array::join
  assert.arity Array::join, 1
  assert.name Array::join, \join
  assert.looksNative Array::join
  assert.nonEnumerable Array::, \join
  assert.strictEqual Array::join.call([1 2 3] void), '1,2,3'
  assert.strictEqual Array::join.call(\123), '1,2,3'
  assert.strictEqual Array::join.call(\123 \|), '1|2|3'
  if STRICT
    assert.throws (!-> Array::join.call null, 0), TypeError
    assert.throws (!-> Array::join.call void, 0), TypeError