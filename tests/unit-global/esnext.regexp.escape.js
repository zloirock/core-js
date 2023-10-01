import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('RegExp.escape', assert => {
  const { escape } = RegExp;
  assert.isFunction(escape);
  assert.arity(escape, 1);
  assert.name(escape, 'escape');
  assert.looksNative(escape);
  assert.nonEnumerable(RegExp, 'escape');

  assert.same(escape('10$'), '\\x310\\$', '10$');
  assert.same(escape('abcdefg_123456'), 'abcdefg_123456', 'abcdefg_123456');
  assert.same(
    escape('(){}[]|,.?*+-^$=<>\\/#&!%:;@~\'"`'),
    '\\(\\)\\{\\}\\[\\]\\|\\,\\.\\?\\*\\+\\-\\^\\$\\=\\<\\>\\\\\\/\\#\\&\\!\\%\\:\\;\\@\\~\\\'\\"\\`',
    '(){}[]|,.?*+-^$=<>\\/#&!%:;@~\'"`',
  );

  const checker = createConversionChecker('10$');
  assert.same(escape(checker), '\\x310\\$', 'checker result');
  assert.same(checker.$valueOf, 0, 'checker valueOf calls');
  assert.same(checker.$toString, 1, 'checker toString calls');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => escape(Symbol('thrower')), TypeError, 'throws on symbol');
  }
});
