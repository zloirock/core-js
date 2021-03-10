import { STRICT } from '../helpers/constants';

import padEnd from 'core-js-pure/full/string/pad-end';
import Symbol from 'core-js-pure/full/symbol';

QUnit.test('String#padEnd', assert => {
  assert.isFunction(padEnd);
  assert.strictEqual(padEnd('abc', 5), 'abc  ');
  assert.strictEqual(padEnd('abc', 4, 'de'), 'abcd');
  assert.strictEqual(padEnd('abc'), 'abc');
  assert.strictEqual(padEnd('abc', 5, '_'), 'abc__');
  assert.strictEqual(padEnd('', 0), '');
  assert.strictEqual(padEnd('foo', 1), 'foo');
  assert.strictEqual(padEnd('foo', 5, ''), 'foo');

  assert.throws(() => padEnd(Symbol(), 10, 'a'), 'throws on symbol context');
  assert.throws(() => padEnd('a', 10, Symbol()), 'throws on symbol argument');

  if (STRICT) {
    assert.throws(() => padEnd(null, 0), TypeError);
    assert.throws(() => padEnd(undefined, 0), TypeError);
  }
});
