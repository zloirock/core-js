import { STRICT } from '../helpers/constants';

QUnit.test('String#padStart', function (assert) {
  var padStart = String.prototype.padStart;
  assert.isFunction(padStart);
  assert.arity(padStart, 1);
  assert.name(padStart, 'padStart');
  assert.looksNative(padStart);
  assert.nonEnumerable(String.prototype, 'padStart');
  assert.strictEqual('abc'.padStart(5), '  abc');
  assert.strictEqual('abc'.padStart(4, 'de'), 'dabc');
  assert.strictEqual('abc'.padStart(), 'abc');
  assert.strictEqual('abc'.padStart(5, '_'), '__abc');
  assert.strictEqual(''.padStart(0), '');
  assert.strictEqual('foo'.padStart(1), 'foo');
  assert.strictEqual('foo'.padStart(5, ''), 'foo');
  if (STRICT) {
    assert['throws'](function () {
      padStart.call(null, 0);
    }, TypeError);
    assert['throws'](function () {
      padStart.call(undefined, 0);
    }, TypeError);
  }
});
