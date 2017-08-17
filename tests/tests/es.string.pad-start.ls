{module, test} = QUnit
module \ES

test 'String#padStart' (assert)!->
  assert.isFunction String::padStart
  assert.arity String::padStart, 1
  assert.name String::padStart, \padStart
  assert.looksNative String::padStart
  assert.nonEnumerable String::, \padStart
  assert.strictEqual 'abc'padStart(5), '  abc'
  assert.strictEqual 'abc'padStart(4 \de), \dabc
  assert.strictEqual 'abc'padStart!,  \abc
  assert.strictEqual 'abc'padStart(5 '_'), '__abc'
  assert.strictEqual ''padStart(0), ''
  assert.strictEqual 'foo'padStart(1), \foo
  assert.strictEqual 'foo'padStart(5 ''), \foo
  if STRICT
    assert.throws (!-> String::padStart.call null, 0), TypeError
    assert.throws (!-> String::padStart.call void, 0), TypeError