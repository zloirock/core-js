import { GLOBAL, STRICT } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#includes', assert => {
  const { includes } = String.prototype;
  assert.isFunction(includes);
  assert.arity(includes, 1);
  assert.name(includes, 'includes');
  assert.looksNative(includes);
  assert.nonEnumerable(String.prototype, 'includes');
  assert.ok(!'abc'.includes());
  assert.ok('aundefinedb'.includes());
  assert.ok('abcd'.includes('b', 1));
  assert.ok(!'abcd'.includes('b', 2));
  if (STRICT) {
    assert.throws(() => {
      return String.prototype.includes.call(null, '.');
    }, TypeError);
    assert.throws(() => {
      return String.prototype.includes.call(undefined, '.');
    }, TypeError);
  }
  const regexp = /./;
  assert.throws(() => {
    return '/./'.includes(regexp);
  }, TypeError);
  regexp[Symbol.match] = false;
  assert.ok((() => {
    try {
      return '/./'.includes(regexp);
    } catch (e) { /* empty */ }
  })());
  const object = {};
  assert.ok((() => {
    try {
      return '[object Object]'.includes(object);
    } catch (e) { /* empty */ }
  })());
  object[Symbol.match] = true;
  assert.throws(() => {
    return '[object Object]'.includes(object);
  }, TypeError);
});
