import { STRICT, WHITESPACES } from '../helpers/constants';

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

  assert.throws(() => trimRight.call(Symbol()), 'throws on symbol context');

  if (STRICT) {
    assert.throws(() => trimRight.call(null, 0), TypeError);
    assert.throws(() => trimRight.call(undefined, 0), TypeError);
  }
});

QUnit.test('String#trimEnd', assert => {
  const { trimEnd, trimRight } = String.prototype;
  assert.isFunction(trimEnd);
  assert.arity(trimEnd, 0);
  assert.name(trimEnd, 'trimEnd');
  assert.looksNative(trimEnd);
  assert.nonEnumerable(String.prototype, 'trimEnd');
  assert.same(trimEnd, trimRight, 'same #trimRight');
  assert.same(' \n  q w e \n  '.trimEnd(), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.same(WHITESPACES.trimEnd(), '', 'removes all whitespaces');
  assert.same('\u200B\u0085'.trimEnd(), '\u200B\u0085', "shouldn't remove this symbols");

  assert.throws(() => trimEnd.call(Symbol()), 'throws on symbol context');

  if (STRICT) {
    assert.throws(() => trimEnd.call(null, 0), TypeError);
    assert.throws(() => trimEnd.call(undefined, 0), TypeError);
  }
});
