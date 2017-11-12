import { STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#filter', function (assert) {
  var filter = Array.prototype.filter;
  assert.isFunction(filter);
  assert.arity(filter, 1);
  assert.name(filter, 'filter');
  assert.looksNative(filter);
  assert.nonEnumerable(Array.prototype, 'filter');
  var array = [1];
  var context = {};
  array.filter(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([1, 2, 3, 4, 5], [1, 2, 3, 'q', {}, 4, true, 5].filter(function (it) {
    return typeof it === 'number';
  }));
  if (STRICT) {
    assert.throws(function () {
      filter.call(null, function () { /* empty */ });
    }, TypeError);
    assert.throws(function () {
      filter.call(undefined, function () { /* empty */ });
    }, TypeError);
  }
  if (NATIVE) {
    assert.ok(function () {
      try {
        return filter.call({
          length: -1,
          0: 1
        }, function () {
          throw new Error();
        });
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
});
