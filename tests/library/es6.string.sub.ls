{module, test} = QUnit
module \ES6

test 'String#sub' (assert)!->
  {sub} = core.String
  assert.isFunction sub
  assert.same sub(\a), '<sub>a</sub>', 'lower case'