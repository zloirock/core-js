QUnit.assert.arity = (fn, length, message)!->
  @pushResult do
    result: fn.length is length
    actual: fn.length
    expected: length
    message: message || "arity is #length"