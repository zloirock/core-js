import { STRICT } from '../helpers/constants';

QUnit.test('Array#join', assert => {
  const { join } = Array.prototype;
  assert.isFunction(join);
  assert.arity(join, 1);
  assert.name(join, 'join');
  assert.looksNative(join);
  assert.nonEnumerable(Array.prototype, 'join');
  assert.strictEqual(join.call([1, 2, 3], undefined), '1,2,3');
  assert.strictEqual(join.call('123'), '1,2,3');
  assert.strictEqual(join.call('123', '|'), '1|2|3');
  if (STRICT) {
    assert.throws(() => join.call(null, 0), TypeError);
    assert.throws(() => join.call(undefined, 0), TypeError);
  }
});
