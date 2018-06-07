import { GLOBAL, STRICT } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#endsWith', assert => {
  const { endsWith } = String.prototype;
  assert.isFunction(endsWith);
  assert.arity(endsWith, 1);
  assert.name(endsWith, 'endsWith');
  assert.looksNative(endsWith);
  assert.nonEnumerable(String.prototype, 'endsWith');
  assert.ok('undefined'.endsWith());
  assert.ok(!'undefined'.endsWith(null));
  assert.ok('abc'.endsWith(''));
  assert.ok('abc'.endsWith('c'));
  assert.ok('abc'.endsWith('bc'));
  assert.ok(!'abc'.endsWith('ab'));
  assert.ok('abc'.endsWith('', NaN));
  assert.ok(!'abc'.endsWith('c', -1));
  assert.ok('abc'.endsWith('a', 1));
  assert.ok('abc'.endsWith('c', Infinity));
  assert.ok('abc'.endsWith('a', true));
  assert.ok(!'abc'.endsWith('c', 'x'));
  assert.ok(!'abc'.endsWith('a', 'x'));
  if (STRICT) {
    assert.throws(() => endsWith.call(null, '.'), TypeError);
    assert.throws(() => endsWith.call(undefined, '.'), TypeError);
  }
  const regexp = /./;
  assert.throws(() => '/./'.endsWith(regexp), TypeError);
  regexp[Symbol.match] = false;
  assert.notThrows(() => '/./'.endsWith(regexp));
  const object = {};
  assert.notThrows(() => '[object Object]'.endsWith(object));
  object[Symbol.match] = true;
  assert.throws(() => '[object Object]'.endsWith(object), TypeError);
});
