/* eslint-disable unicorn/prefer-string-trim-start-end -- required for testing */
import { WHITESPACES } from '../helpers/constants.js';

QUnit.test('String#trimRight', assert => {
  const { trimRight } = String.prototype;
  assert.isFunction(trimRight);
  assert.arity(trimRight, 0);
  assert.name(trimRight, 'trimEnd');
  assert.looksNative(trimRight);
  assert.nonEnumerable(String.prototype, 'trimRight');
  assert.same(' \n  q w e \n  '.trimRight(), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.same(WHITESPACES.trimRight(), '', 'removes all whitespaces');
  assert.same('\u200B\u0085'.trimRight(), '\u200B\u0085', "shouldn't remove this symbols");

  assert.throws(() => trimRight.call(Symbol('trimRight test')), 'throws on symbol context');

  assert.throws(() => trimRight.call(null, 0), TypeError);
  assert.throws(() => trimRight.call(undefined, 0), TypeError);
});
