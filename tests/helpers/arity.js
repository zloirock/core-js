QUnit.assert.arity = function (fn, length, message) {
  this.pushResult({
    result: fn.length === length,
    actual: fn.length,
    expected: length,
    message: message || 'arity is ' + length
  });
};
