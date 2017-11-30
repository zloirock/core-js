import { STRICT } from '../helpers/constants';

QUnit.test('String#replaceAll', assert => {
  const { replaceAll } = core.String;
  const { Symbol } = core;
  assert.isFunction(replaceAll);
  assert.same(replaceAll('q=query+string+parameters', '+', ' '), 'q=query string parameters');
  assert.same(replaceAll('foo', 'o', {}), 'f[object Object][object Object]');
  assert.same(replaceAll('[object Object]x[object Object]', {}, 'y'), 'yxy');
  assert.same(replaceAll({}, 'bject', 'lolo'), '[ololo Ololo]');
  if (STRICT) {
    assert.throws(() => {
      return replaceAll(null, 'a', 'b');
    }, TypeError);
    assert.throws(() => {
      return replaceAll(undefined, 'a', 'b');
    }, TypeError);
  }
  const regexp = /./;
  assert.throws(() => {
    return replaceAll('/./', regexp, 'a');
  }, TypeError);
  regexp[Symbol.match] = false;
  assert.ok((() => {
    try {
      return replaceAll('/./', regexp, 'a') === 'a';
    } catch (e) { /* empty */ }
  })());
  const object = {};
  assert.ok(function () {
    try {
      return replaceAll('[object Object]', object, 'a') === 'a';
    } catch (e) { /* empty */ }
  }());
  object[Symbol.match] = true;
  assert.throws(() => {
    return replaceAll('[object Object]', object, 'a');
  }, TypeError);
});
