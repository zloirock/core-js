{module, test} = QUnit
module \ES

test 'String#link' (assert)!->
  assert.isFunction String::link
  assert.arity String::link, 1
  assert.name String::link, \link
  assert.looksNative String::link
  assert.nonEnumerable String::, \link
  assert.same 'a'link(\b), '<a href="b">a</a>', 'lower case'
  assert.same 'a'link(\"), '<a href="&quot;">a</a>', 'escape quotes'