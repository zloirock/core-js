/* eslint-disable unicorn/prefer-string-trim-start-end -- required for testing */
import { WHITESPACES } from '../helpers/constants.js';

QUnit.test('String#trimLeft', assert => {
  const { trimLeft } = String.prototype;
  assert.isFunction(trimLeft);
  assert.arity(trimLeft, 0);
  assert.name(trimLeft, 'trimStart');
  assert.looksNative(trimLeft);
  assert.nonEnumerable(String.prototype, 'trimLeft');
  assert.same(' \n  q w e \n  '.trimLeft(), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.same(WHITESPACES.trimLeft(), '', 'removes all whitespaces');
  assert.same('\u200B\u0085'.trimLeft(), '\u200B\u0085', "shouldn't remove this symbols");

  assert.throws(() => trimLeft.call(Symbol('trimLeft test')), 'throws on symbol context');

  assert.throws(() => trimLeft.call(null, 0), TypeError);
  assert.throws(() => trimLeft.call(undefined, 0), TypeError);
});
