import { STRICT } from '../helpers/constants';

QUnit.test('String#at', assert => {
  const { at } = String.prototype;
  assert.isFunction(at);
  assert.arity(at, 1);
  assert.name(at, 'at');
  assert.looksNative(at);
  assert.nonEnumerable(String.prototype, 'at');
  // String that starts with a BMP symbol
  assert.same('abc\uD834\uDF06def'.at(-Infinity), '');
  assert.same('abc\uD834\uDF06def'.at(-1), '');
  assert.same('abc\uD834\uDF06def'.at(-0), 'a');
  assert.same('abc\uD834\uDF06def'.at(+0), 'a');
  assert.same('abc\uD834\uDF06def'.at(1), 'b');
  assert.same('abc\uD834\uDF06def'.at(3), '\uD834\uDF06');
  assert.same('abc\uD834\uDF06def'.at(4), '\uDF06');
  assert.same('abc\uD834\uDF06def'.at(5), 'd');
  assert.same('abc\uD834\uDF06def'.at(42), '');
  assert.same('abc\uD834\uDF06def'.at(Infinity), '');
  assert.same('abc\uD834\uDF06def'.at(null), 'a');
  assert.same('abc\uD834\uDF06def'.at(undefined), 'a');
  assert.same('abc\uD834\uDF06def'.at(), 'a');
  assert.same('abc\uD834\uDF06def'.at(false), 'a');
  assert.same('abc\uD834\uDF06def'.at(NaN), 'a');
  assert.same('abc\uD834\uDF06def'.at(''), 'a');
  assert.same('abc\uD834\uDF06def'.at('_'), 'a');
  assert.same('abc\uD834\uDF06def'.at('1'), 'b');
  assert.same('abc\uD834\uDF06def'.at([]), 'a');
  assert.same('abc\uD834\uDF06def'.at({}), 'a');
  assert.same('abc\uD834\uDF06def'.at(-0.9), 'a');
  assert.same('abc\uD834\uDF06def'.at(1.9), 'b');
  assert.same('abc\uD834\uDF06def'.at(7.9), 'f');
  assert.same('abc\uD834\uDF06def'.at(2 ** 32), '');
  // String that starts with an astral symbol
  assert.same('\uD834\uDF06def'.at(-Infinity), '');
  assert.same('\uD834\uDF06def'.at(-1), '');
  assert.same('\uD834\uDF06def'.at(-0), '\uD834\uDF06');
  assert.same('\uD834\uDF06def'.at(0), '\uD834\uDF06');
  assert.same('\uD834\uDF06def'.at(1), '\uDF06');
  assert.same('\uD834\uDF06def'.at(2), 'd');
  assert.same('\uD834\uDF06def'.at(3), 'e');
  assert.same('\uD834\uDF06def'.at(4), 'f');
  assert.same('\uD834\uDF06def'.at(42), '');
  assert.same('\uD834\uDF06def'.at(Infinity), '');
  assert.same('\uD834\uDF06def'.at(null), '\uD834\uDF06');
  assert.same('\uD834\uDF06def'.at(undefined), '\uD834\uDF06');
  assert.same('\uD834\uDF06def'.at(), '\uD834\uDF06');
  assert.same('\uD834\uDF06def'.at(false), '\uD834\uDF06');
  assert.same('\uD834\uDF06def'.at(NaN), '\uD834\uDF06');
  assert.same('\uD834\uDF06def'.at(''), '\uD834\uDF06');
  assert.same('\uD834\uDF06def'.at('_'), '\uD834\uDF06');
  assert.same('\uD834\uDF06def'.at('1'), '\uDF06');
  // Lone high surrogates
  assert.same('\uD834abc'.at(-Infinity), '');
  assert.same('\uD834abc'.at(-1), '');
  assert.same('\uD834abc'.at(-0), '\uD834');
  assert.same('\uD834abc'.at(0), '\uD834');
  assert.same('\uD834abc'.at(1), 'a');
  assert.same('\uD834abc'.at(42), '');
  assert.same('\uD834abc'.at(Infinity), '');
  assert.same('\uD834abc'.at(null), '\uD834');
  assert.same('\uD834abc'.at(undefined), '\uD834');
  assert.same('\uD834abc'.at(), '\uD834');
  assert.same('\uD834abc'.at(false), '\uD834');
  assert.same('\uD834abc'.at(NaN), '\uD834');
  assert.same('\uD834abc'.at(''), '\uD834');
  assert.same('\uD834abc'.at('_'), '\uD834');
  assert.same('\uD834abc'.at('1'), 'a');
  // Lone low surrogates
  assert.same('\uDF06abc'.at(-Infinity), '');
  assert.same('\uDF06abc'.at(-1), '');
  assert.same('\uDF06abc'.at(-0), '\uDF06');
  assert.same('\uDF06abc'.at(0), '\uDF06');
  assert.same('\uDF06abc'.at(1), 'a');
  assert.same('\uDF06abc'.at(42), '');
  assert.same('\uDF06abc'.at(Infinity), '');
  assert.same('\uDF06abc'.at(null), '\uDF06');
  assert.same('\uDF06abc'.at(undefined), '\uDF06');
  assert.same('\uDF06abc'.at(), '\uDF06');
  assert.same('\uDF06abc'.at(false), '\uDF06');
  assert.same('\uDF06abc'.at(NaN), '\uDF06');
  assert.same('\uDF06abc'.at(''), '\uDF06');
  assert.same('\uDF06abc'.at('_'), '\uDF06');
  assert.same('\uDF06abc'.at('1'), 'a');
  assert.same(at.call(42, 0), '4');
  assert.same(at.call(42, 1), '2');
  assert.same(at.call({
    toString() {
      return 'abc';
    },
  }, 2), 'c');
  if (STRICT) {
    assert.throws(() => at.call(null, 0), TypeError);
    assert.throws(() => at.call(undefined, 0), TypeError);
  }
});
