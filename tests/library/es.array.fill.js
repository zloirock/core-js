import { STRICT } from '../helpers/constants';

QUnit.test('Array#fill', function (assert) {
  var fill = core.Array.fill;
  assert.isFunction(fill);
  var array = fill(Array(5), 5);
  assert.strictEqual(array, array);
  assert.deepEqual(fill(Array(5), 5), [5, 5, 5, 5, 5]);
  assert.deepEqual(fill(Array(5), 5, 1), [undefined, 5, 5, 5, 5]);
  assert.deepEqual(fill(Array(5), 5, 1, 4), [undefined, 5, 5, 5, undefined]);
  assert.deepEqual(fill(Array(5), 5, 6, 1), [undefined, undefined, undefined, undefined, undefined]);
  assert.deepEqual(fill(Array(5), 5, -3, 4), [undefined, undefined, 5, 5, undefined]);
  if (STRICT) {
    assert['throws'](function () {
      fill(null, 0);
    }, TypeError);
    assert['throws'](function () {
      fill(undefined, 0);
    }, TypeError);
  }
});
