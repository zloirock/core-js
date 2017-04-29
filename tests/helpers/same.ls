QUnit.assert.same = (a, b, message)!->
  @pushResult do
    result: if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b
    actual: a
    expected: b
    message: message