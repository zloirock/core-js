{module, test} = QUnit
module \ES7

test 'String#padLeft' (assert)->
  assert.isFunction String::padLeft
  assert.arity String::padLeft, 1
  assert.name String::padLeft, \padLeft
  assert.looksNative String::padLeft
  assert.strictEqual 'abc'padLeft(5), '  abc'
  assert.strictEqual 'abc'padLeft(4 \de), \dabc
  assert.strictEqual 'abc'padLeft!,  \abc
  assert.strictEqual 'abc'padLeft(5 '_'), '__abc'
  assert.strictEqual ''padLeft(0), ''
  assert.strictEqual 'foo'padLeft(1), \foo
  if STRICT
    assert.throws (-> String::padLeft.call null, 0), TypeError
    assert.throws (-> String::padLeft.call void, 0), TypeError