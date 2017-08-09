{module, test} = QUnit
module \ES

test 'String#italics' (assert)!->
  {italics} = core.String
  assert.isFunction italics
  assert.same italics(\a), '<i>a</i>', 'lower case'