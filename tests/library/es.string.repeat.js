import { STRICT } from '../helpers/constants';

QUnit.test('String#repeat', assert => {
  const { repeat } = core.String;
  assert.isFunction(repeat);
  assert.strictEqual(repeat('qwe', 3), 'qweqweqwe');
  assert.strictEqual(repeat('qwe', 2.5), 'qweqwe');
  assert.throws(() => {
    return repeat('qwe', -1);
  }, RangeError);
  assert.throws(() => {
    return repeat('qwe', Infinity);
  }, RangeError);
  if (STRICT) {
    assert.throws(() => {
      return repeat(null, 1);
    }, TypeError);
    assert.throws(() => {
      return repeat(undefined, 1);
    }, TypeError);
  }
});
