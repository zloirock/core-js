{module, test} = QUnit
module \ES

test 'String#anchor' (assert)!->
  assert.isFunction String::anchor
  assert.arity String::anchor, 1
  assert.name String::anchor, \anchor
  assert.looksNative String::anchor
  assert.nonEnumerable String::, \anchor
  assert.same 'a'anchor(\b), '<a name="b">a</a>', 'lower case'
  assert.same 'a'anchor(\"), '<a name="&quot;">a</a>', 'escape quotes'