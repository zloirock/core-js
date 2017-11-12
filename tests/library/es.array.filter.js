import { STRICT } from '../helpers/constants';

QUnit.test('Array#filter', function (assert) {
  var filter = core.Array.filter;
  assert.isFunction(filter);
  var array = [1];
  var context = {};
  filter(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([1, 2, 3, 4, 5], filter([1, 2, 3, 'q', {}, 4, true, 5], function (it) {
    return typeof it === 'number';
  }));
  if (STRICT) {
    assert['throws'](function () {
      filter(null, function () { /* empty */ });
    }, TypeError);
    assert['throws'](function () {
      filter(undefined, function () { /* empty */ });
    }, TypeError);
  }
});
