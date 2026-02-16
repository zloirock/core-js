import { GLOBAL, STRICT } from '../helpers/constants.js';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#endsWith', assert => {
  const { endsWith } = String.prototype;
  assert.isFunction(endsWith);
  assert.arity(endsWith, 1);
  assert.name(endsWith, 'endsWith');
  assert.looksNative(endsWith);
  assert.nonEnumerable(String.prototype, 'endsWith');
  assert.true('undefined'.endsWith());
  assert.false('undefined'.endsWith(null));
  assert.true('abc'.endsWith(''));
  assert.true('abc'.endsWith('c'));
  assert.true('abc'.endsWith('bc'));
  assert.false('abc'.endsWith('ab'));
  assert.true('abc'.endsWith('', NaN));
  assert.false('abc'.endsWith('c', -1));
  assert.true('abc'.endsWith('a', 1));
  assert.true('abc'.endsWith('c', Infinity));
  assert.true('abc'.endsWith('a', true));
  assert.false('abc'.endsWith('c', 'x'));
  assert.false('abc'.endsWith('a', 'x'));

  if (typeof Symbol == 'function' && !Symbol.sham) {
    const symbol = Symbol('endsWith test');
    assert.throws(() => endsWith.call(symbol, 'b'), 'throws on symbol context');
    assert.throws(() => endsWith.call('a', symbol), 'throws on symbol argument');
  }

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
  // side-effect ordering: ToString(searchString) should happen before ToIntegerOrInfinity(endPosition)
  const order = [];
  'abc'.endsWith(
    { toString() { order.push('search'); return 'c'; } },
    { valueOf() { order.push('pos'); return 3; } },
  );
  assert.deepEqual(order, ['search', 'pos'], 'ToString(searchString) before ToIntegerOrInfinity(endPosition)');
});
