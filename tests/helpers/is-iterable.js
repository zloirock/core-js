QUnit.assert.isIterable = function (it, message) {
  this.pushResult({
    result: global.core && core.isIterable ? core.isIterable(it) : !!it[global.Symbol && Symbol.iterator],
    actual: false,
    expected: true,
    message: message || 'is iterable'
  });
};
