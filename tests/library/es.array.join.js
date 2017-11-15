import { STRICT } from '../helpers/constants';

QUnit.test('Array#join', assert => {
  const { join } = core.Array;
  assert.isFunction(join);
  assert.strictEqual(join([1, 2, 3], undefined), '1,2,3');
  assert.strictEqual(join('123'), '1,2,3');
  assert.strictEqual(join('123', '|'), '1|2|3');
  if (STRICT) {
    assert.throws(() => {
      return join(null);
    }, TypeError);
    assert.throws(() => {
      return join(undefined);
    }, TypeError);
  }
});
