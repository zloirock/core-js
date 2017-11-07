var test = QUnit.test;

test('Array#sort', function (assert) {
  var sort = Array.prototype.sort;
  assert.isFunction(sort);
  assert.arity(sort, 1);
  assert.name(sort, 'sort');
  assert.looksNative(sort);
  assert.nonEnumerable(Array.prototype, 'sort');
  assert.ok(function () {
    try {
      return [1, 2, 3].sort(undefined);
    } catch (e) { /* empty */ }
  }(), 'works with undefined');
  assert['throws'](function () {
    [1, 2, 3].sort(null);
  }, 'throws on null');
  assert['throws'](function () {
    [1, 2, 3].sort({});
  }, 'throws on {}');
  if (STRICT) {
    assert['throws'](function () {
      return sort.call(null);
    }, TypeError, 'ToObject(this)');
    assert['throws'](function () {
      return sort.call(undefined);
    }, TypeError, 'ToObject(this)');
  }
});
