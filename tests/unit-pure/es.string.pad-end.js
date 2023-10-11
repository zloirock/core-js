import { STRICT } from '../helpers/constants.js';

import Symbol from '@core-js/pure/es/symbol';
import padEnd from '@core-js/pure/es/string/pad-end';

QUnit.test('String#padEnd', assert => {
  assert.isFunction(padEnd);
  assert.same(padEnd('abc', 5), 'abc  ');
  assert.same(padEnd('abc', 4, 'de'), 'abcd');
  assert.same(padEnd('abc'), 'abc');
  assert.same(padEnd('abc', 5, '_'), 'abc__');
  assert.same(padEnd('', 0), '');
  assert.same(padEnd('foo', 1), 'foo');
  assert.same(padEnd('foo', 5, ''), 'foo');

  const thrower = { toString() { throw new Error('oops'); } };
  assert.throws(() => padEnd('a', 10, thrower), 'throws on thrower argument conversion');
  assert.same(padEnd('abc', 2, thrower), 'abc', 'does not throw on thrower argument when no padding needed');

  const symbol = Symbol('padEnd test');
  assert.throws(() => padEnd(symbol, 10, 'a'), 'throws on symbol context');
  assert.throws(() => padEnd('a', 10, symbol), 'throws on symbol argument');
  assert.same(padEnd('abc', 2, symbol), 'abc', 'does not throw on symbol fillString when no padding needed');

  if (STRICT) {
    assert.throws(() => padEnd(null, 0), TypeError);
    assert.throws(() => padEnd(undefined, 0), TypeError);
  }
});
