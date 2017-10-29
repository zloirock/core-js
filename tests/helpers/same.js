QUnit.assert.same = function (a, b, message) {
  this.pushResult({
    result: a === b ? a !== 0 || 1 / a === 1 / b : a != a && b != b,
    actual: a,
    expected: b,
    message: message
  });
};
