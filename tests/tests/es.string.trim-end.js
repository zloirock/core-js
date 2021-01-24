import { STRICT, WHITESPACES } from '../helpers/constants';

QUnit.test('String#trimEnd', assert => {
  const { trimEnd, trimRight } = String.prototype;
  assert.isFunction(trimEnd);
  assert.arity(trimEnd, 0);
  assert.name(trimEnd, 'trimEnd');
  assert.looksNative(trimEnd);
  assert.nonEnumerable(String.prototype, 'trimEnd');
  assert.same(trimEnd, trimRight, 'same #trimRight');
  assert.strictEqual(' \n  q w e \n  '.trimEnd(), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.strictEqual(WHITESPACES.trimEnd(), '', 'removes all whitespaces');
  assert.strictEqual('\u200B\u0085'.trimEnd(), '\u200B\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimEnd.call(null, 0), TypeError);
    assert.throws(() => trimEnd.call(undefined, 0), TypeError);
  }
});
