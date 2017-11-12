import { STRICT } from '../helpers/constants';

QUnit.test('String#padEnd', function (assert) {
  var padEnd = core.String.padEnd;
  assert.isFunction(padEnd);
  assert.strictEqual(padEnd('abc', 5), 'abc  ');
  assert.strictEqual(padEnd('abc', 4, 'de'), 'abcd');
  assert.strictEqual(padEnd('abc'), 'abc');
  assert.strictEqual(padEnd('abc', 5, '_'), 'abc__');
  assert.strictEqual(padEnd('', 0), '');
  assert.strictEqual(padEnd('foo', 1), 'foo');
  assert.strictEqual(padEnd('foo', 5, ''), 'foo');
  if (STRICT) {
    assert.throws(function () {
      padEnd(null, 0);
    }, TypeError);
    assert.throws(function () {
      padEnd(undefined, 0);
    }, TypeError);
  }
});
