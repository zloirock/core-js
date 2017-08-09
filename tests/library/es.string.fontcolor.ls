{module, test} = QUnit
module \ES

test 'String#fontcolor' (assert)!->
  {fontcolor} = core.String
  assert.isFunction fontcolor
  assert.same fontcolor(\a \b), '<font color="b">a</font>', 'lower case'
  assert.same fontcolor(\a \"), '<font color="&quot;">a</font>', 'escape quotes'