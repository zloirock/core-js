QUnit.assert.isFunction = (fn, message)!->
  @pushResult do
    result: typeof fn is \function or typeof! fn is \Function
    actual: no
    expected: on
    message: message || 'is function'