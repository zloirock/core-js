{module, test} = QUnit
module \ES

test 'String#anchor' (assert)!->
  {anchor} = core.String
  assert.isFunction anchor
  assert.same anchor(\a \b), '<a name="b">a</a>', 'lower case'
  assert.same anchor(\a \"), '<a name="&quot;">a</a>', 'escape quotes'