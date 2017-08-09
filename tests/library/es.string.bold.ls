{module, test} = QUnit
module \ES

test 'String#bold' (assert)!->
  {bold} = core.String
  assert.isFunction bold
  assert.same bold(\a), '<b>a</b>', 'lower case'