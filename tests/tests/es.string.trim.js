import { STRICT, WHITESPACES } from '../helpers/constants';

QUnit.test('String#trim', assert => {
  const { trim } = String.prototype;
  assert.isFunction(''.trim);
  assert.arity(trim, 0);
  assert.name(trim, 'trim');
  assert.looksNative(trim);
  assert.nonEnumerable(String.prototype, 'trim');
  assert.strictEqual(' \n  q w e \n  '.trim(), 'q w e', 'removes whitespaces at left & right side of string');
  assert.strictEqual(WHITESPACES.trim(), '', 'removes all whitespaces');
  assert.strictEqual('\u200b\u0085'.trim(), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trim.call(null, 0), TypeError);
    assert.throws(() => trim.call(undefined, 0), TypeError);
  }
});
