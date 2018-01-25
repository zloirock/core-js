import { STRICT, WHITESPACES } from '../helpers/constants';

QUnit.test('String#trimRight', assert => {
  const { trimRight } = String.prototype;
  assert.isFunction(trimRight);
  assert.arity(trimRight, 0);
  assert.name(trimRight, 'trimRight');
  assert.looksNative(trimRight);
  assert.nonEnumerable(String.prototype, 'trimRight');
  assert.strictEqual(' \n  q w e \n  '.trimRight(), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.strictEqual(WHITESPACES.trimRight(), '', 'removes all whitespaces');
  assert.strictEqual('\u200b\u0085'.trimRight(), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimRight.call(null, 0), TypeError);
    assert.throws(() => trimRight.call(undefined, 0), TypeError);
  }
});

QUnit.test('String#trimEnd', assert => {
  const { trimEnd } = String.prototype;
  assert.isFunction(trimEnd);
  assert.arity(trimEnd, 0);
  assert.name(trimEnd, 'trimRight');
  assert.looksNative(trimEnd);
  assert.nonEnumerable(String.prototype, 'trimEnd');
  assert.same(trimEnd, String.prototype.trimRight, 'same #trimRight');
  assert.strictEqual(' \n  q w e \n  '.trimEnd(), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.strictEqual(WHITESPACES.trimEnd(), '', 'removes all whitespaces');
  assert.strictEqual('\u200b\u0085'.trimEnd(), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimEnd.call(null, 0), TypeError);
    assert.throws(() => trimEnd.call(undefined, 0), TypeError);
  }
});
