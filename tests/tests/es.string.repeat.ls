{module, test} = QUnit
module \ES

test 'String#repeat' (assert)!->
  assert.isFunction String::repeat
  assert.arity String::repeat, 1
  assert.name String::repeat, \repeat
  assert.looksNative String::repeat
  assert.nonEnumerable String::, \repeat
  assert.strictEqual 'qwe'repeat(3), \qweqweqwe
  assert.strictEqual 'qwe'repeat(2.5), \qweqwe
  assert.throws (!-> 'qwe'repeat -1), RangeError
  assert.throws (!-> 'qwe'repeat Infinity), RangeError
  if STRICT
    assert.throws (!-> String::repeat.call null, 1), TypeError
    assert.throws (!-> String::repeat.call void, 1), TypeError