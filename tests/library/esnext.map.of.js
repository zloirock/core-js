var test = QUnit.test;

test('Map.of', function (assert) {
  var Map = core.Map;
  var of = Map.of;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.ok(Map.of() instanceof Map);
  assert.deepEqual(core.Array.from(Map.of([1, 2])), [[1, 2]]);
  assert.deepEqual(core.Array.from(Map.of([1, 2], [2, 3], [1, 4])), [[1, 4], [2, 3]]);
  assert['throws'](function () {
    of(1);
  });
  var arg = null;
  function F(it) {
    return arg = it;
  }
  of.call(F, 1, 2, 3);
  assert.deepEqual(arg, [1, 2, 3]);
});
