{module, test} = QUnit
module \ES

test 'String#small' (assert)!->
  {small} = core.String
  assert.isFunction small
  assert.same small(\a), '<small>a</small>', 'lower case'