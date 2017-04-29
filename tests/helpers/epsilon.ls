QUnit.assert.epsilon = (a, b, E, message)!->
  @pushResult do
    result: Math.abs(a - b) <= if E? => E else 1e-11
    actual: a
    expected: b
    message: message