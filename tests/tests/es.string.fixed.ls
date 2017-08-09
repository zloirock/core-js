{module, test} = QUnit
module \ES

test 'String#fixed' (assert)!->
  assert.isFunction String::fixed
  assert.arity String::fixed, 0
  assert.name String::fixed, \fixed
  assert.looksNative String::fixed
  assert.nonEnumerable String::, \fixed
  assert.same 'a'fixed!, '<tt>a</tt>', 'lower case'