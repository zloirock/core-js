{module, test} = QUnit
module \ES

test 'String#strike' (assert)!->
  {strike} = core.String
  assert.isFunction strike
  assert.same strike(\a), '<strike>a</strike>', 'lower case'