import { GLOBAL } from '../helpers/constants.js';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#startsWith', assert => {
  const { startsWith } = String.prototype;
  assert.isFunction(startsWith);
  assert.arity(startsWith, 1);
  assert.name(startsWith, 'startsWith');
  assert.looksNative(startsWith);
  assert.nonEnumerable(String.prototype, 'startsWith');
  assert.true('undefined'.startsWith());
  assert.false('undefined'.startsWith(null));
  assert.true('abc'.startsWith(''));
  assert.true('abc'.startsWith('a'));
  assert.true('abc'.startsWith('ab'));
  assert.false('abc'.startsWith('bc'));
  assert.true('abc'.startsWith('', NaN));
  assert.true('abc'.startsWith('a', -1));
  assert.false('abc'.startsWith('a', 1));
  assert.false('abc'.startsWith('a', Infinity));
  assert.true('abc'.startsWith('b', true));
  assert.true('abc'.startsWith('a', 'x'));

  if (typeof Symbol == 'function' && !Symbol.sham) {
    const symbol = Symbol('startsWith test');
    assert.throws(() => startsWith.call(symbol, 'b'), 'throws on symbol context');
    assert.throws(() => startsWith.call('a', symbol), 'throws on symbol argument');
  }

  assert.throws(() => startsWith.call(null, '.'), TypeError);
  assert.throws(() => startsWith.call(undefined, '.'), TypeError);

  const regexp = /./;
  assert.throws(() => '/./'.startsWith(regexp), TypeError);
  regexp[Symbol.match] = false;
  assert.notThrows(() => '/./'.startsWith(regexp));
  const object = {};
  assert.notThrows(() => '[object Object]'.startsWith(object));
  object[Symbol.match] = true;
  assert.throws(() => '[object Object]'.startsWith(object), TypeError);
  // side-effect ordering: ToString(searchString) should happen before ToIntegerOrInfinity(position)
  const order = [];
  'abc'.startsWith(
    { toString() { order.push('search'); return 'a'; } },
    { valueOf() { order.push('pos'); return 0; } },
  );
  assert.deepEqual(order, ['search', 'pos'], 'ToString(searchString) before ToIntegerOrInfinity(position)');
});
