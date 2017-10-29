var toString = {}.toString;
QUnit.assert.isFunction = function (fn, message) {
  this.pushResult({
    result: typeof fn === 'function' || toString.call(fn).slice(8, -1) === 'Function',
    actual: false,
    expected: true,
    message: message || 'is function'
  });
};
