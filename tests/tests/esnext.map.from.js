var test = QUnit.test;

test('Map.from', function (assert) {
  var from = Map.from;
  var toArray = Array.from;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');
  assert.looksNative(from);
  assert.nonEnumerable(Map, 'from');
  assert.ok(Map.from() instanceof Map);
  assert.deepEqual(toArray(Map.from([])), []);
  assert.deepEqual(toArray(Map.from([[1, 2]])), [[1, 2]]);
  assert.deepEqual(toArray(Map.from([[1, 2], [2, 3], [1, 4]])), [[1, 4], [2, 3]]);
  assert.deepEqual(toArray(Map.from(createIterable([[1, 2], [2, 3], [1, 4]]))), [[1, 4], [2, 3]]);
  var pair = [1, 2];
  var context = {};
  Map.from([pair], function (element, index) {
    assert.same(element, pair);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
  assert['throws'](function () {
    from([1, 2]);
  });
  var arg = null;
  function F(it) {
    return arg = it;
  }
  from.call(F, createIterable([1, 2, 3]), function (it) {
    return Math.pow(it, 2);
  });
  assert.deepEqual(arg, [1, 4, 9]);
});
