{module, test} = QUnit
module \ES

test 'Date.now' (assert)!->
  {now} = Date
  assert.isFunction now
  assert.arity now, 0
  assert.name now, \now
  assert.looksNative now
  assert.nonEnumerable Date, \now
  assert.ok +new Date - now! < 10, 'Date.now() ~ +new Date'