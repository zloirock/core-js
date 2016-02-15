QUnit.assert.epsilon = (a, b, E, message)!->
  @push (Math.abs(a - b) <= if E? => E else 1e-11), a, b, message