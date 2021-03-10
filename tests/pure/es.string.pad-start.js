import { STRICT } from '../helpers/constants';

import padStart from 'core-js-pure/full/string/pad-start';
import Symbol from 'core-js-pure/full/symbol';

QUnit.test('String#padStart', assert => {
  assert.isFunction(padStart);
  assert.strictEqual(padStart('abc', 5), '  abc');
  assert.strictEqual(padStart('abc', 4, 'de'), 'dabc');
  assert.strictEqual(padStart('abc'), 'abc');
  assert.strictEqual(padStart('abc', 5, '_'), '__abc');
  assert.strictEqual(padStart('', 0), '');
  assert.strictEqual(padStart('foo', 1), 'foo');
  assert.strictEqual(padStart('foo', 5, ''), 'foo');

  assert.throws(() => padStart(Symbol(), 10, 'a'), 'throws on symbol context');
  assert.throws(() => padStart('a', 10, Symbol()), 'throws on symbol argument');

  if (STRICT) {
    assert.throws(() => padStart(null, 0), TypeError);
    assert.throws(() => padStart(undefined, 0), TypeError);
  }
});
