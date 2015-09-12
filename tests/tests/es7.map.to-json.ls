{module, test} = QUnit
module \ES7

test 'Map#toJSON' (assert)->
  assert.ok typeof! Map::toJSON is \Function, 'is function'
  assert.strictEqual Map::toJSON.name, \toJSON, 'name is "toJSON"'
  assert.strictEqual Map::toJSON.length, 0, 'arity is 0'
  assert.ok /native code/.test(Map::toJSON), 'looks like native'
  if JSON?
    assert.strictEqual JSON.stringify(new Map [[\a \b], [\c \d]] ), '[["a","b"],["c","d"]]', 'Works'