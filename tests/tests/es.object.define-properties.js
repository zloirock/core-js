var test = QUnit.test;

test('Object.defineProperties', function (assert) {
  var defineProperties = Object.defineProperties;
  assert.isFunction(defineProperties);
  assert.arity(defineProperties, 2);
  assert.name(defineProperties, 'defineProperties');
  assert.looksNative(defineProperties);
  assert.nonEnumerable(Object, 'defineProperties');
  var source = {};
  var result = defineProperties(source, { q: { value: 42 }, w: { value: 33 } });
  assert.same(result, source);
  assert.same(result.q, 42);
  assert.same(result.w, 33);
});
