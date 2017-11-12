import { STRICT } from '../helpers/constants';

QUnit.test('Array#join', function (assert) {
  var join = core.Array.join;
  assert.isFunction(join);
  assert.strictEqual(join([1, 2, 3], undefined), '1,2,3');
  assert.strictEqual(join('123'), '1,2,3');
  assert.strictEqual(join('123', '|'), '1|2|3');
  if (STRICT) {
    assert.throws(function () {
      join(null);
    }, TypeError);
    assert.throws(function () {
      join(undefined);
    }, TypeError);
  }
});
