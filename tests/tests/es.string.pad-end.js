import { STRICT } from '../helpers/constants';

QUnit.test('String#padEnd', function (assert) {
  var padEnd = String.prototype.padEnd;
  assert.isFunction(padEnd);
  assert.arity(padEnd, 1);
  assert.name(padEnd, 'padEnd');
  assert.looksNative(padEnd);
  assert.nonEnumerable(String.prototype, 'padEnd');
  assert.strictEqual('abc'.padEnd(5), 'abc  ');
  assert.strictEqual('abc'.padEnd(4, 'de'), 'abcd');
  assert.strictEqual('abc'.padEnd(), 'abc');
  assert.strictEqual('abc'.padEnd(5, '_'), 'abc__');
  assert.strictEqual(''.padEnd(0), '');
  assert.strictEqual('foo'.padEnd(1), 'foo');
  assert.strictEqual('foo'.padEnd(5, ''), 'foo');
  if (STRICT) {
    assert.throws(function () {
      padEnd.call(null, 0);
    }, TypeError);
    assert.throws(function () {
      padEnd.call(undefined, 0);
    }, TypeError);
  }
});
