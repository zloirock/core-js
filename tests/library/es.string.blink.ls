{module, test} = QUnit
module \ES

test 'String#blink' (assert)!->
  {blink} = core.String
  assert.isFunction blink
  assert.same blink(\a), '<blink>a</blink>', 'lower case'