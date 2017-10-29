QUnit.assert.name = function (fn, name, message) {
  this.pushResult({
    result: fn.name === name,
    actual: fn.name,
    expected: name,
    message: message || "name is '" + name + "'"
  });
};
