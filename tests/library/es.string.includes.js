import { STRICT } from '../helpers/constants';

QUnit.test('String#includes', assert => {
  const { includes } = core.String;
  const { Symbol } = core;
  assert.isFunction(includes);
  assert.ok(!includes('abc'));
  assert.ok(includes('aundefinedb'));
  assert.ok(includes('abcd', 'b', 1));
  assert.ok(!includes('abcd', 'b', 2));
  if (STRICT) {
    assert.throws(() => {
      includes(null, '.');
    }, TypeError);
    assert.throws(() => {
      includes(undefined, '.');
    }, TypeError);
  }
  const re = /./;
  assert.throws(() => {
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
  const O = {};
  assert.ok(function () {
    try {
      return includes('[object Object]', O);
    } catch (e) {
      return false;
    }
  }());
  O[Symbol.match] = true;
  assert.throws(() => {
    return includes('[object Object]', O);
  }, TypeError);
});
