import { STRICT } from '../helpers/constants';

QUnit.test('String#repeat', function (assert) {
  var repeat = String.prototype.repeat;
  assert.isFunction(repeat);
  assert.arity(repeat, 1);
  assert.name(repeat, 'repeat');
  assert.looksNative(repeat);
  assert.nonEnumerable(String.prototype, 'repeat');
  assert.strictEqual('qwe'.repeat(3), 'qweqweqwe');
  assert.strictEqual('qwe'.repeat(2.5), 'qweqwe');
  assert['throws'](function () {
    'qwe'.repeat(-1);
  }, RangeError);
  assert['throws'](function () {
    'qwe'.repeat(Infinity);
  }, RangeError);
  if (STRICT) {
    assert['throws'](function () {
      repeat.call(null, 1);
    }, TypeError);
    assert['throws'](function () {
      repeat.call(undefined, 1);
    }, TypeError);
  }
});
