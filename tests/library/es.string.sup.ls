{module, test} = QUnit
module \ES

test 'String#sup' (assert)!->
  {sup} = core.String
  assert.isFunction sup
  assert.same sup(\a), '<sup>a</sup>', 'lower case'