{module, test} = QUnit
module \ES

test 'Number.MIN_SAFE_INTEGER' (assert)!->
  assert.ok \MIN_SAFE_INTEGER of Number
  assert.nonEnumerable Number, \MIN_SAFE_INTEGER
  assert.strictEqual Number.MIN_SAFE_INTEGER, -2^53 + 1, 'Is -2^53 + 1'