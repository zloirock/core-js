{module, test} = QUnit
module \ES

test 'Number.MAX_SAFE_INTEGER' (assert)!->
  assert.strictEqual core.Number.MAX_SAFE_INTEGER, 2^53 - 1, 'Is 2^53 - 1'