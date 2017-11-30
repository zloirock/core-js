import { GLOBAL, STRICT } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#replaceAll', assert => {
  const { replaceAll } = String.prototype;
  assert.isFunction(replaceAll);
  assert.arity(replaceAll, 2);
  assert.name(replaceAll, 'replaceAll');
  assert.looksNative(replaceAll);
  assert.nonEnumerable(String.prototype, 'replaceAll');
  assert.same('q=query+string+parameters'.replaceAll('+', ' '), 'q=query string parameters');
  assert.same('foo'.replaceAll('o', {}), 'f[object Object][object Object]');
  assert.same('[object Object]x[object Object]'.replaceAll({}, 'y'), 'yxy');
  assert.same(replaceAll.call({}, 'bject', 'lolo'), '[ololo Ololo]');
  if (STRICT) {
    assert.throws(() => {
      return replaceAll.call(null, 'a', 'b');
    }, TypeError);
    assert.throws(() => {
      return replaceAll.call(undefined, 'a', 'b');
    }, TypeError);
  }
  const regexp = /./;
  assert.throws(() => {
    return '/./'.replaceAll(regexp, 'a');
  }, TypeError);
  regexp[Symbol.match] = false;
  assert.ok((() => {
    try {
      return '/./'.replaceAll(regexp, 'a') === 'a';
    } catch (e) { /* empty */ }
  })());
  const object = {};
  assert.ok((() => {
    try {
      return '[object Object]'.replaceAll(object, 'a') === 'a';
    } catch (e) { /* empty */ }
  })());
  object[Symbol.match] = true;
  assert.throws(() => {
    return '[object Object]'.replaceAll(object, 'a');
  }, TypeError);
});
