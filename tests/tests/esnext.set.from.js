import { createIterable } from '../helpers/helpers';

QUnit.test('Set.from', function (assert) {
  var from = Set.from;
  var toArray = Array.from;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');
  assert.looksNative(from);
  assert.nonEnumerable(Set, 'from');
  assert.ok(Set.from() instanceof Set);
  assert.deepEqual(toArray(Set.from([])), []);
  assert.deepEqual(toArray(Set.from([1])), [1]);
  assert.deepEqual(toArray(Set.from([1, 2, 3, 2, 1])), [1, 2, 3]);
  assert.deepEqual(toArray(Set.from(createIterable([1, 2, 3, 2, 1]))), [1, 2, 3]);
  var context = {};
  Set.from([1], function (element, index) {
    assert.same(element, 1);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
  assert['throws'](function () {
    from(1);
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
