{module, test} = QUnit
module \ES6

test 'String#link' (assert)!->
  {link} = core.String
  assert.isFunction link
  assert.same link(\a \b), '<a href="b">a</a>', 'lower case'
  assert.same link(\a \"), '<a href="&quot;">a</a>', 'escape quotes'