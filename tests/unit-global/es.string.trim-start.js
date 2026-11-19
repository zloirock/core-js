import { WHITESPACES } from '../helpers/constants.js';

QUnit.test('String#trimStart', assert => {
  const { trimStart, trimLeft } = String.prototype;
  assert.isFunction(trimStart);
  assert.arity(trimStart, 0);
  assert.name(trimStart, 'trimStart');
  assert.looksNative(trimStart);
  assert.nonEnumerable(String.prototype, 'trimStart');
  assert.same(trimStart, trimLeft, 'same #trimLeft');
  assert.same(' \n  q w e \n  '.trimStart(), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.same(WHITESPACES.trimStart(), '', 'removes all whitespaces');
  assert.same('\u200B\u0085'.trimStart(), '\u200B\u0085', "shouldn't remove this symbols");

  assert.throws(() => trimStart.call(Symbol('trimStart test')), 'throws on symbol context');

  assert.throws(() => trimStart.call(null, 0), TypeError);
  assert.throws(() => trimStart.call(undefined, 0), TypeError);
});
