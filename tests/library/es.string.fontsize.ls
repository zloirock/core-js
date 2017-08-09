{module, test} = QUnit
module \ES

test 'String#fontsize' (assert)!->
  {fontsize} = core.String
  assert.isFunction fontsize
  assert.same fontsize(\a \b), '<font size="b">a</font>', 'lower case'
  assert.same fontsize(\a \"), '<font size="&quot;">a</font>', 'escape quotes'