import { STRICT, WHITESPACES } from '../helpers/constants';

QUnit.test('String#trimStart', assert => {
  const { trimStart, trimLeft } = String.prototype;
  assert.isFunction(trimStart);
  assert.arity(trimStart, 0);
  assert.name(trimStart, 'trimStart');
  assert.looksNative(trimStart);
  assert.nonEnumerable(String.prototype, 'trimStart');
  assert.same(trimStart, trimLeft, 'same #trimLeft');
  assert.strictEqual(' \n  q w e \n  '.trimStart(), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(WHITESPACES.trimStart(), '', 'removes all whitespaces');
  assert.strictEqual('\u200B\u0085'.trimStart(), '\u200B\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimStart.call(null, 0), TypeError);
    assert.throws(() => trimStart.call(undefined, 0), TypeError);
  }
});
