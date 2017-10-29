QUnit.assert.looksNative = function (fn, message) {
  this.pushResult({
    result: /native code/.test(Function.prototype.toString.call(fn)),
    actual: false,
    expected: true,
    message: message || 'looks native'
  });
};
