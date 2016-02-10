{module, test} = QUnit
module \ES7

test 'Set#toJSON' (assert)!->
  assert.isFunction Set::toJSON
  assert.name Set::toJSON, \toJSON
  assert.arity Set::toJSON, 0
  assert.looksNative Set::toJSON
  assert.nonEnumerable Set::, \toJSON
  if JSON?
    assert.strictEqual JSON.stringify(new Set [1 2 3 2 1] ), '[1,2,3]', 'Works'