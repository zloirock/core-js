import { STRICT } from '../helpers/constants';

import at from 'core-js-pure/features/string/at';

QUnit.test('String#at', assert => {
  assert.isFunction(at);
  // String that starts with a BMP symbol
  assert.same(at('abc\uD834\uDF06def', -Infinity), '');
  assert.same(at('abc\uD834\uDF06def', -1), '');
  assert.same(at('abc\uD834\uDF06def', -0), 'a');
  assert.same(at('abc\uD834\uDF06def', +0), 'a');
  assert.same(at('abc\uD834\uDF06def', 1), 'b');
  assert.same(at('abc\uD834\uDF06def', 3), '\uD834\uDF06');
  assert.same(at('abc\uD834\uDF06def', 4), '\uDF06');
  assert.same(at('abc\uD834\uDF06def', 5), 'd');
  assert.same(at('abc\uD834\uDF06def', 42), '');
  assert.same(at('abc\uD834\uDF06def', Infinity), '');
  assert.same(at('abc\uD834\uDF06def', null), 'a');
  assert.same(at('abc\uD834\uDF06def', undefined), 'a');
  assert.same(at('abc\uD834\uDF06def'), 'a');
  assert.same(at('abc\uD834\uDF06def', false), 'a');
  assert.same(at('abc\uD834\uDF06def', NaN), 'a');
  assert.same(at('abc\uD834\uDF06def', ''), 'a');
  assert.same(at('abc\uD834\uDF06def', '_'), 'a');
  assert.same(at('abc\uD834\uDF06def', '1'), 'b');
  assert.same(at('abc\uD834\uDF06def', []), 'a');
  assert.same(at('abc\uD834\uDF06def', {}), 'a');
  assert.same(at('abc\uD834\uDF06def', -0.9), 'a');
  assert.same(at('abc\uD834\uDF06def', 1.9), 'b');
  assert.same(at('abc\uD834\uDF06def', 7.9), 'f');
  assert.same(at('abc\uD834\uDF06def', 2 ** 32), '');
  // String that starts with an astral symbol
  assert.same(at('\uD834\uDF06def', -Infinity), '');
  assert.same(at('\uD834\uDF06def', -1), '');
  assert.same(at('\uD834\uDF06def', -0), '\uD834\uDF06');
  assert.same(at('\uD834\uDF06def', 0), '\uD834\uDF06');
  assert.same(at('\uD834\uDF06def', 1), '\uDF06');
  assert.same(at('\uD834\uDF06def', 2), 'd');
  assert.same(at('\uD834\uDF06def', 3), 'e');
  assert.same(at('\uD834\uDF06def', 4), 'f');
  assert.same(at('\uD834\uDF06def', 42), '');
  assert.same(at('\uD834\uDF06def', Infinity), '');
  assert.same(at('\uD834\uDF06def', null), '\uD834\uDF06');
  assert.same(at('\uD834\uDF06def', undefined), '\uD834\uDF06');
  assert.same(at('\uD834\uDF06def'), '\uD834\uDF06');
  assert.same(at('\uD834\uDF06def', false), '\uD834\uDF06');
  assert.same(at('\uD834\uDF06def', NaN), '\uD834\uDF06');
  assert.same(at('\uD834\uDF06def', ''), '\uD834\uDF06');
  assert.same(at('\uD834\uDF06def', '_'), '\uD834\uDF06');
  assert.same(at('\uD834\uDF06def', '1'), '\uDF06');
  // Lone high surrogates
  assert.same(at('\uD834abc', -Infinity), '');
  assert.same(at('\uD834abc', -1), '');
  assert.same(at('\uD834abc', -0), '\uD834');
  assert.same(at('\uD834abc', 0), '\uD834');
  assert.same(at('\uD834abc', 1), 'a');
  assert.same(at('\uD834abc', 42), '');
  assert.same(at('\uD834abc', Infinity), '');
  assert.same(at('\uD834abc', null), '\uD834');
  assert.same(at('\uD834abc', undefined), '\uD834');
  assert.same(at('\uD834abc'), '\uD834');
  assert.same(at('\uD834abc', false), '\uD834');
  assert.same(at('\uD834abc', NaN), '\uD834');
  assert.same(at('\uD834abc', ''), '\uD834');
  assert.same(at('\uD834abc', '_'), '\uD834');
  assert.same(at('\uD834abc', '1'), 'a');
  // Lone low surrogates
  assert.same(at('\uDF06abc', -Infinity), '');
  assert.same(at('\uDF06abc', -1), '');
  assert.same(at('\uDF06abc', -0), '\uDF06');
  assert.same(at('\uDF06abc', 0), '\uDF06');
  assert.same(at('\uDF06abc', 1), 'a');
  assert.same(at('\uDF06abc', 42), '');
  assert.same(at('\uDF06abc', Infinity), '');
  assert.same(at('\uDF06abc', null), '\uDF06');
  assert.same(at('\uDF06abc', undefined), '\uDF06');
  assert.same(at('\uDF06abc'), '\uDF06');
  assert.same(at('\uDF06abc', false), '\uDF06');
  assert.same(at('\uDF06abc', NaN), '\uDF06');
  assert.same(at('\uDF06abc', ''), '\uDF06');
  assert.same(at('\uDF06abc', '_'), '\uDF06');
  assert.same(at('\uDF06abc', '1'), 'a');
  assert.same(at(42, 0), '4');
  assert.same(at(42, 1), '2');
  assert.same(at({
    toString() {
      return 'abc';
    },
  }, 2), 'c');
  if (STRICT) {
    assert.throws(() => at(null, 0), TypeError);
    assert.throws(() => at(undefined, 0), TypeError);
  }
});
