var test = QUnit.test;

test('Object.defineProperty', function (assert) {
  var defineProperty = Object.defineProperty;
  var create = Object.create;
  assert.isFunction(defineProperty);
  assert.arity(defineProperty, 3);
  assert.name(defineProperty, 'defineProperty');
  assert.looksNative(defineProperty);
  assert.nonEnumerable(Object, 'defineProperty');
  var source = {};
  var result = defineProperty(source, 'q', {
    value: 42
  });
  assert.same(result, source);
  assert.same(result.q, 42);
  assert['throws'](function () {
    defineProperty(42, 1, {});
  });
  assert['throws'](function () {
    defineProperty({}, create(null), {});
  });
  assert['throws'](function () {
    defineProperty({}, 1, 1);
  });
});
