import { STRICT, WHITESPACES } from '../helpers/constants';

QUnit.test('String#trimLeft', assert => {
  const { trimLeft } = String.prototype;
  assert.isFunction(trimLeft);
  assert.arity(trimLeft, 0);
  assert.name(trimLeft, 'trimStart');
  assert.looksNative(trimLeft);
  assert.nonEnumerable(String.prototype, 'trimLeft');
  assert.strictEqual(' \n  q w e \n  '.trimLeft(), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(WHITESPACES.trimLeft(), '', 'removes all whitespaces');
  assert.strictEqual('\u200B\u0085'.trimLeft(), '\u200B\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimLeft.call(null, 0), TypeError);
    assert.throws(() => trimLeft.call(undefined, 0), TypeError);
  }
});
