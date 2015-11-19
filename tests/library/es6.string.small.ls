{module, test} = QUnit
module \ES6

test 'String#small' (assert)!->
  {small} = core.String
  assert.isFunction small
  assert.same small(\a), '<small>a</small>', 'lower case'