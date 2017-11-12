QUnit.test('WeakMap.of', function (assert) {
  var WeakMap = core.WeakMap;
  var of = WeakMap.of;
  assert.isFunction(of);
  assert.arity(of, 0);
  var array = [];
  assert.ok(WeakMap.of() instanceof WeakMap);
  assert.same(WeakMap.of([array, 2]).get(array), 2);
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
