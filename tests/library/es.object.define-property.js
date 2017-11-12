QUnit.test('Object.defineProperty', function (assert) {
  var defineProperty = core.Object.defineProperty;
  var create = core.Object.create;
  assert.isFunction(defineProperty);
  assert.arity(defineProperty, 3);
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
