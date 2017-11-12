import { STRICT } from '../helpers/constants';

QUnit.test('String#includes', function (assert) {
  var includes = core.String.includes;
  var Symbol = core.Symbol;
  assert.isFunction(includes);
  assert.ok(!includes('abc'));
  assert.ok(includes('aundefinedb'));
  assert.ok(includes('abcd', 'b', 1));
  assert.ok(!includes('abcd', 'b', 2));
  if (STRICT) {
    assert.throws(function () {
      includes(null, '.');
    }, TypeError);
    assert.throws(function () {
      includes(undefined, '.');
    }, TypeError);
  }
  var re = /./;
  assert.throws(function () {
    includes('/./', re);
  }, TypeError);
  re[Symbol.match] = false;
  assert.ok(function () {
    try {
      return includes('/./', re);
    } catch (e) {
      return false;
    }
  }());
  var O = {};
  assert.ok(function () {
    try {
      return includes('[object Object]', O);
    } catch (e) {
      return false;
    }
  }());
  O[Symbol.match] = true;
  assert.throws(function () {
    includes('[object Object]', O);
  }, TypeError);
});
