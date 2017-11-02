var test = QUnit.test;

test('Array#sort', function (assert) {
  var sort = core.Array.sort;
  assert.isFunction(sort);
  assert.ok(!!function () {
    try {
      return sort([1, 2, 3], undefined);
    } catch (e) { /* empty */ }
  }(), 'works with undefined');
  assert['throws'](function () {
    sort([1, 2, 3], null);
  }, 'throws on null');
  assert['throws'](function () {
    sort([1, 2, 3], {});
  }, 'throws on {}');
  if (STRICT) {
    assert['throws'](function () {
      sort(null);
    }, TypeError, 'ToObject(this)');
    assert['throws'](function () {
      sort(undefined);
    }, TypeError, 'ToObject(this)');
  }
});
