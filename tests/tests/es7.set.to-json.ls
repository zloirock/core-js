{module, test} = QUnit
module \ES7

test 'Set#toJSON' (assert)->
  assert.ok typeof! Set::toJSON is \Function, 'Is function'
  assert.strictEqual Set::toJSON.name, \toJSON, 'name is "toJSON"'
  assert.strictEqual Set::toJSON.length, 0, 'length is 0'
  assert.ok /native code/.test(Set::toJSON), 'looks like native'
  if JSON?
    assert.strictEqual JSON.stringify(new Set [1 2 3 2 1] ), '[1,2,3]', 'Works'