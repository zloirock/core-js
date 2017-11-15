import { STRICT } from '../helpers/constants';

QUnit.test('String#padStart', assert => {
  const { padStart } = core.String;
  assert.isFunction(padStart);
  assert.strictEqual(padStart('abc', 5), '  abc');
  assert.strictEqual(padStart('abc', 4, 'de'), 'dabc');
  assert.strictEqual(padStart('abc'), 'abc');
  assert.strictEqual(padStart('abc', 5, '_'), '__abc');
  assert.strictEqual(padStart('', 0), '');
  assert.strictEqual(padStart('foo', 1), 'foo');
  assert.strictEqual(padStart('foo', 5, ''), 'foo');
  if (STRICT) {
    assert.throws(() => {
      return padStart(null, 0);
    }, TypeError);
    assert.throws(() => {
      return padStart(undefined, 0);
    }, TypeError);
  }
});
