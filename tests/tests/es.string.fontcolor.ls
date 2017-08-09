{module, test} = QUnit
module \ES

test 'String#fontcolor' (assert)!->
  assert.isFunction String::fontcolor
  assert.arity String::fontcolor, 1
  assert.name String::fontcolor, \fontcolor
  assert.looksNative String::fontcolor
  assert.nonEnumerable String::, \fontcolor
  assert.same 'a'fontcolor(\b), '<font color="b">a</font>', 'lower case'
  assert.same 'a'fontcolor(\"), '<font color="&quot;">a</font>', 'escape quotes'