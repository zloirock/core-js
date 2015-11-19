{module, test} = QUnit
module \ES6

test 'String#blink' (assert)!->
  {blink} = core.String
  assert.isFunction blink
  assert.same blink(\a), '<blink>a</blink>', 'lower case'