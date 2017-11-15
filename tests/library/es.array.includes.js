import { STRICT } from '../helpers/constants';

QUnit.test('Array#includes', assert => {
  const { includes } = core.Array;
  assert.isFunction(includes);
  const object = {};
  const array = [1, 2, 3, -0, object];
  assert.ok(includes(array, 1));
  assert.ok(includes(array, -0));
  assert.ok(includes(array, 0));
  assert.ok(includes(array, object));
  assert.ok(!includes(array, 4));
  assert.ok(!includes(array, -0.5));
  assert.ok(!includes(array, {}));
  assert.ok(includes(Array(1), undefined));
  assert.ok(includes([NaN], NaN));
  if (STRICT) {
    assert.throws(() => {
      return includes(null, 0);
    }, TypeError);
    assert.throws(() => {
      return includes(undefined, 0);
    }, TypeError);
  }
});
