import { STRICT, WHITESPACES } from '../helpers/constants';

QUnit.test('String#trimRight', assert => {
  const { trimRight } = String.prototype;
  assert.isFunction(trimRight);
  assert.arity(trimRight, 0);
  assert.name(trimRight, 'trimEnd');
  assert.looksNative(trimRight);
  assert.nonEnumerable(String.prototype, 'trimRight');
  assert.strictEqual(' \n  q w e \n  '.trimRight(), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.strictEqual(WHITESPACES.trimRight(), '', 'removes all whitespaces');
  assert.strictEqual('\u200B\u0085'.trimRight(), '\u200B\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimRight.call(null, 0), TypeError);
    assert.throws(() => trimRight.call(undefined, 0), TypeError);
  }
});
