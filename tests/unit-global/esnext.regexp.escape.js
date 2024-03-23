import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('RegExp.escape', assert => {
  const { escape } = RegExp;
  assert.isFunction(escape);
  assert.arity(escape, 1);
  assert.name(escape, 'escape');
  assert.looksNative(escape);
  assert.nonEnumerable(RegExp, 'escape');

  assert.same(escape('10$'), '\\x310\\x24', '10$');
  assert.same(escape('abcdefg_123456'), 'abcdefg_123456', 'abcdefg_123456');
  assert.same(
    escape('(){}[]|,.?*+-^$=<>\\/#&!%:;@~\'"`'),
    '\\x28\\x29\\x7b\\x7d\\x5b\\x5d\\x7c\\x2c\\x2e\\x3f\\x2a\\x2b\\x2d\\x5e\\x24\\x3d\\x3c\\x3e\\x5c\\x2f\\x23\\x26\\x21\\x25\\x3a\\x3b\\x40\\x7e\\x27\\x22\\x60',
    '(){}[]|,.?*+-^$=<>\\/#&!%:;@~\'"`',
  );
  assert.same(
    escape('\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'),
    '\\x09\\x0a\\x0b\\x0c\\x0d\\x20\\xa0\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\u2028\\u2029\\ufeff',
    'whitespaces',
  );

  const checker = createConversionChecker('10$');
  assert.same(escape(checker), '\\x310\\x24', 'checker result');
  assert.same(checker.$valueOf, 0, 'checker valueOf calls');
  assert.same(checker.$toString, 1, 'checker toString calls');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => escape(Symbol('thrower')), TypeError, 'throws on symbol');
  }
});
