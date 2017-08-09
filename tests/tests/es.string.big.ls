{module, test} = QUnit
module \ES

test 'String#big' (assert)!->
  assert.isFunction String::big
  assert.arity String::big, 0
  assert.name String::big, \big
  assert.looksNative String::big
  assert.nonEnumerable String::, \big
  assert.same 'a'big!, '<big>a</big>', 'lower case'