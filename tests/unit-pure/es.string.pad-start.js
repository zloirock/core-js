import { STRICT } from '../helpers/constants.js';

import Symbol from '@core-js/pure/es/symbol';
import padStart from '@core-js/pure/es/string/pad-start';

QUnit.test('String#padStart', assert => {
  assert.isFunction(padStart);
  assert.same(padStart('abc', 5), '  abc');
  assert.same(padStart('abc', 4, 'de'), 'dabc');
  assert.same(padStart('abc'), 'abc');
  assert.same(padStart('abc', 5, '_'), '__abc');
  assert.same(padStart('', 0), '');
  assert.same(padStart('foo', 1), 'foo');
  assert.same(padStart('foo', 5, ''), 'foo');

  const symbol = Symbol('padEnd test');
  assert.throws(() => padStart(symbol, 10, 'a'), 'throws on symbol context');
  assert.throws(() => padStart('a', 10, symbol), 'throws on symbol argument');

  if (STRICT) {
    assert.throws(() => padStart(null, 0), TypeError);
    assert.throws(() => padStart(undefined, 0), TypeError);
  }
});
