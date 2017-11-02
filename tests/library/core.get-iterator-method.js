var test = QUnit.test;

test('core.getIteratorMethod', function (assert) {
  var getIteratorMethod = core.getIteratorMethod;
  assert.isFunction(getIteratorMethod);
  var iterable = createIterable([]);
  var iterFn = getIteratorMethod(iterable);
  assert.isFunction(iterFn);
  assert.isIterator(iterFn.call(iterable));
  assert.isFunction(getIteratorMethod([]));
  assert.isFunction(getIteratorMethod(function () {
    return arguments;
  }()));
  assert.isFunction(getIteratorMethod(Array.prototype));
  assert.strictEqual(getIteratorMethod({}), undefined);
});
