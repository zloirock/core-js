import { STRICT } from '../helpers/constants';

QUnit.test('String#endsWith', function (assert) {
  var endsWith = core.String.endsWith;
  var Symbol = core.Symbol;
  assert.isFunction(endsWith);
  assert.ok(endsWith('undefined'));
  assert.ok(!endsWith('undefined', null));
  assert.ok(endsWith('abc', ''));
  assert.ok(endsWith('abc', 'c'));
  assert.ok(endsWith('abc', 'bc'));
  assert.ok(!endsWith('abc', 'ab'));
  assert.ok(endsWith('abc', '', NaN));
  assert.ok(!endsWith('abc', 'c', -1));
  assert.ok(endsWith('abc', 'a', 1));
  assert.ok(endsWith('abc', 'c', Infinity));
  assert.ok(endsWith('abc', 'a', true));
  assert.ok(!endsWith('abc', 'c', 'x'));
  assert.ok(!endsWith('abc', 'a', 'x'));
  if (STRICT) {
    assert['throws'](function () {
      endsWith(null, '.');
    }, TypeError);
    assert['throws'](function () {
      endsWith(undefined, '.');
    }, TypeError);
  }
  var regexp = /./;
  assert['throws'](function () {
    endsWith('/./', regexp);
  }, TypeError);
  regexp[Symbol.match] = false;
  assert.ok(function () {
    try {
      return endsWith('/./', regexp);
    } catch (e) { /* empty */ }
  }());
  var object = {};
  assert.ok(function () {
    try {
      return endsWith('[object Object]', object);
    } catch (e) { /* empty */ }
  }());
  object[Symbol.match] = true;
  assert['throws'](function () {
    endsWith('[object Object]', object);
  }, TypeError);
});
