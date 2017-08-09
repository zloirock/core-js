{module, test} = QUnit
module \ES

test 'String#fixed' (assert)!->
  {fixed} = core.String
  assert.isFunction fixed
  assert.same fixed(\a), '<tt>a</tt>', 'lower case'