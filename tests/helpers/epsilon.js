QUnit.assert.epsilon = function (a, b, E, message) {
  this.pushResult({
    result: Math.abs(a - b) <= (E != null ? E : 1e-11),
    actual: a,
    expected: b,
    message: message
  });
};
