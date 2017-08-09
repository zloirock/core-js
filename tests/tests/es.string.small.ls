{module, test} = QUnit
module \ES

test 'String#small' (assert)!->
  assert.isFunction String::small
  assert.arity String::small, 0
  assert.name String::small, \small
  assert.looksNative String::small
  assert.nonEnumerable String::, \small
  assert.same 'a'small!, '<small>a</small>', 'lower case'