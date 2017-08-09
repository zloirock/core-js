{module, test} = QUnit
module \ES

test 'String#bold' (assert)!->
  assert.isFunction String::bold
  assert.arity String::bold, 0
  assert.name String::bold, \bold
  assert.looksNative String::bold
  assert.nonEnumerable String::, \bold
  assert.same 'a'bold!, '<b>a</b>', 'lower case'