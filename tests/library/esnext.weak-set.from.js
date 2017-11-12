import { createIterable } from '../helpers/helpers';

QUnit.test('WeakSet.from', function (assert) {
  var WeakSet = core.WeakSet;
  var from = WeakSet.from;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.ok(WeakSet.from() instanceof WeakSet);
  var array = [];
  assert.ok(WeakSet.from([array]).has(array));
  assert.ok(WeakSet.from(createIterable([array])).has(array));
  var object = {};
  var context = {};
  WeakSet.from([object], function (element, index) {
    assert.same(element, object);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
  assert.throws(function () {
    from({});
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
