{module, test} = QUnit
module \ES6

test 'String#strike' (assert)!->
  {strike} = core.String
  assert.isFunction strike
  assert.same strike(\a), '<strike>a</strike>', 'lower case'