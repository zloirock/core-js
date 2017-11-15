import { STRICT } from '../helpers/constants';

QUnit.test('String#startsWith', assert => {
  const { startsWith } = core.String;
  const { Symbol } = core;
  assert.isFunction(startsWith);
  assert.ok(startsWith('undefined'));
  assert.ok(!startsWith('undefined', null));
  assert.ok(startsWith('abc', ''));
  assert.ok(startsWith('abc', 'a'));
  assert.ok(startsWith('abc', 'ab'));
  assert.ok(!startsWith('abc', 'bc'));
  assert.ok(startsWith('abc', '', NaN));
  assert.ok(startsWith('abc', 'a', -1));
  assert.ok(!startsWith('abc', 'a', 1));
  assert.ok(!startsWith('abc', 'a', Infinity));
  assert.ok(startsWith('abc', 'b', true));
  assert.ok(startsWith('abc', 'a', 'x'));
  if (STRICT) {
    assert.throws(() => {
      return startsWith(null, '.');
    }, TypeError);
    assert.throws(() => {
      return startsWith(undefined, '.');
    }, TypeError);
  }
  const regexp = /./;
  assert.throws(() => {
    return startsWith('/./', regexp);
  }, TypeError);
  regexp[Symbol.match] = false;
  assert.ok((() => {
    try {
      return startsWith('/./', regexp);
    } catch (e) { /* empty */ }
  })());
  const object = {};
  assert.ok((() => {
    try {
      return startsWith('[object Object]', object);
    } catch (e) { /* empty */ }
  })());
  object[Symbol.match] = true;
  assert.throws(() => {
    return startsWith('[object Object]', object);
  }, TypeError);
});
