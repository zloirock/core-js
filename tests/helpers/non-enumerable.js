var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
QUnit.assert.nonEnumerable = function (O, key, message) {
  if (DESCRIPTORS) this.pushResult({
    result: !propertyIsEnumerable.call(O, key),
    actual: false,
    expected: true,
    message: message || (typeof key === 'symbol' ? 'method' : key) + ' is non-enumerable'
  });
};
