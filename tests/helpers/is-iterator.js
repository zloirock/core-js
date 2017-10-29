QUnit.assert.isIterator = function (it, message) {
  this.pushResult({
    result: typeof it === 'object' && typeof it.next === 'function',
    actual: false,
    expected: true,
    message: message || 'is iterator'
  });
};
