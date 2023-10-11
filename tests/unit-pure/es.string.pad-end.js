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

  const symbol = Symbol('padEnd test');
  assert.throws(() => padEnd(symbol, 10, 'a'), 'throws on symbol context');
  assert.throws(() => padEnd('a', 10, symbol), 'throws on symbol argument');

  if (STRICT) {
    assert.throws(() => padEnd(null, 0), TypeError);
    assert.throws(() => padEnd(undefined, 0), TypeError);
  }
});
