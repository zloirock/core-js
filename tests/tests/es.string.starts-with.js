import { GLOBAL, STRICT } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#startsWith', assert => {
  const { startsWith } = String.prototype;
  assert.isFunction(startsWith);
  assert.arity(startsWith, 1);
  assert.name(startsWith, 'startsWith');
  assert.looksNative(startsWith);
  assert.nonEnumerable(String.prototype, 'startsWith');
  assert.ok('undefined'.startsWith());
  assert.ok(!'undefined'.startsWith(null));
  assert.ok('abc'.startsWith(''));
  assert.ok('abc'.startsWith('a'));
  assert.ok('abc'.startsWith('ab'));
  assert.ok(!'abc'.startsWith('bc'));
  assert.ok('abc'.startsWith('', NaN));
  assert.ok('abc'.startsWith('a', -1));
  assert.ok(!'abc'.startsWith('a', 1));
  assert.ok(!'abc'.startsWith('a', Infinity));
  assert.ok('abc'.startsWith('b', true));
  assert.ok('abc'.startsWith('a', 'x'));
  if (STRICT) {
    assert.throws(() => startsWith.call(null, '.'), TypeError);
    assert.throws(() => startsWith.call(undefined, '.'), TypeError);
  }
  const regexp = /./;
  assert.throws(() => '/./'.startsWith(regexp), TypeError);
  regexp[Symbol.match] = false;
  assert.notThrows(() => '/./'.startsWith(regexp));
  const object = {};
  assert.notThrows(() => '[object Object]'.startsWith(object));
  object[Symbol.match] = true;
  assert.throws(() => '[object Object]'.startsWith(object), TypeError);
});
