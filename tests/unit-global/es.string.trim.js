import { WHITESPACES } from '../helpers/constants.js';

QUnit.test('String#trim', assert => {
  const { trim } = String.prototype;
  assert.isFunction(''.trim);
  assert.arity(trim, 0);
  assert.name(trim, 'trim');
  assert.looksNative(trim);
  assert.nonEnumerable(String.prototype, 'trim');
  assert.same(' \n  q w e \n  '.trim(), 'q w e', 'removes whitespaces at left & right side of string');
  assert.same(WHITESPACES.trim(), '', 'removes all whitespaces');
  assert.same('\u200B\u0085'.trim(), '\u200B\u0085', "shouldn't remove this symbols");

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => trim.call(Symbol('trim test')), 'throws on symbol context');
  }

  assert.throws(() => trim.call(null, 0), TypeError);
  assert.throws(() => trim.call(undefined, 0), TypeError);
});
