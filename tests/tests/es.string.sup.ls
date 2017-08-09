{module, test} = QUnit
module \ES

test 'String#sup' (assert)!->
  assert.isFunction String::sup
  assert.arity String::sup, 0
  assert.name String::sup, \sup
  assert.looksNative String::sup
  assert.nonEnumerable String::, \sup
  assert.same 'a'sup!, '<sup>a</sup>', 'lower case'