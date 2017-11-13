import { createIterable } from '../helpers/helpers';

QUnit.test('WeakMap.from', function (assert) {
  var from = WeakMap.from;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');
  assert.looksNative(from);
  assert.nonEnumerable(WeakMap, 'from');
  assert.ok(WeakMap.from() instanceof WeakMap);
  var array = [];
  assert.same(WeakMap.from([[array, 2]]).get(array), 2);
  assert.same(WeakMap.from(createIterable([[array, 2]])).get(array), 2);
  var pair = [{}, 1];
  var context = {};
  WeakMap.from([pair], function (element, index) {
    assert.same(element, pair);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
  assert.throws(function () {
    from([{}, 1]);
  });
  var arg = null;
  function F(it) {
    return arg = it;
  }
  from.call(F, createIterable([1, 2, 3]), function (it) {
    return it ** 2;
  });
  assert.deepEqual(arg, [1, 4, 9]);
});
