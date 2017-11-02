var test = QUnit.test;

test('core.getIterator', function (assert) {
  var getIterator = core.getIterator;
  assert.isFunction(getIterator);
  assert.isIterator(getIterator([]));
  assert.isIterator(getIterator(function () {
    return arguments;
  }()));
  assert.isIterator(getIterator(createIterable([])));
  assert['throws'](function () {
    getIterator({});
  }, TypeError);
});
