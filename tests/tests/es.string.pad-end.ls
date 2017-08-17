{module, test} = QUnit
module \ES

test 'String#padEnd' (assert)!->
  assert.isFunction String::padEnd
  assert.arity String::padEnd, 1
  assert.name String::padEnd, \padEnd
  assert.looksNative String::padEnd
  assert.nonEnumerable String::, \padEnd
  assert.strictEqual 'abc'padEnd(5), 'abc  '
  assert.strictEqual 'abc'padEnd(4, \de), \abcd
  assert.strictEqual 'abc'padEnd!,  \abc
  assert.strictEqual 'abc'padEnd(5 '_'), 'abc__'
  assert.strictEqual ''padEnd(0), ''
  assert.strictEqual 'foo'padEnd(1), \foo
  assert.strictEqual 'foo'padEnd(5 ''), \foo
  if STRICT
    assert.throws (!-> String::padEnd.call null, 0), TypeError
    assert.throws (!-> String::padEnd.call void, 0), TypeError