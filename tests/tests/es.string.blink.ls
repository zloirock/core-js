{module, test} = QUnit
module \ES

test 'String#blink' (assert)!->
  assert.isFunction String::blink
  assert.arity String::blink, 0
  assert.name String::blink, \blink
  assert.looksNative String::blink
  assert.nonEnumerable String::, \blink
  assert.same 'a'blink!, '<blink>a</blink>', 'lower case'