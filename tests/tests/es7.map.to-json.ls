{module, test} = QUnit
module \ES7

test 'Map#toJSON' (assert)!->
  assert.isFunction Map::toJSON
  assert.name Map::toJSON, \toJSON
  assert.arity Map::toJSON, 0
  assert.looksNative Map::toJSON
  assert.nonEnumerable Map::, \toJSON
  if JSON?
    assert.strictEqual JSON.stringify(new Map [[\a \b], [\c \d]] ), '[["a","b"],["c","d"]]', 'Works'