import { GLOBAL } from '../helpers/constants.js';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#includes', assert => {
  const { includes } = String.prototype;
  assert.isFunction(includes);
  assert.arity(includes, 1);
  assert.name(includes, 'includes');
  assert.looksNative(includes);
  assert.nonEnumerable(String.prototype, 'includes');
  assert.false('abc'.includes());
  assert.true('aundefinedb'.includes());
  assert.true('abcd'.includes('b', 1));
  assert.false('abcd'.includes('b', 2));

  if (typeof Symbol == 'function' && !Symbol.sham) {
    const symbol = Symbol('includes test');
    assert.throws(() => includes.call(symbol, 'b'), 'throws on symbol context');
    assert.throws(() => includes.call('a', symbol), 'throws on symbol argument');
  }

  assert.throws(() => includes.call(null, '.'), TypeError);
  assert.throws(() => includes.call(undefined, '.'), TypeError);

  const regexp = /./;
  assert.throws(() => '/./'.includes(regexp), TypeError);
  regexp[Symbol.match] = false;
  assert.notThrows(() => '/./'.includes(regexp));
  const object = {};
  assert.notThrows(() => '[object Object]'.includes(object));
  object[Symbol.match] = true;
  assert.throws(() => '[object Object]'.includes(object), TypeError);
});
