import { STRICT, WHITESPACES } from '../helpers/constants';

import { trimLeft, trimStart } from 'core-js-pure/features/string';

QUnit.test('String#trimLeft', assert => {
  assert.isFunction(trimLeft);
  assert.strictEqual(trimLeft(' \n  q w e \n  '), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(trimLeft(WHITESPACES), '', 'removes all whitespaces');
  assert.strictEqual(trimLeft('\u200b\u0085'), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimLeft(null, 0), TypeError);
    assert.throws(() => trimLeft(undefined, 0), TypeError);
  }
});

QUnit.test('String#trimStart', assert => {
  assert.isFunction(trimStart);
  assert.strictEqual(trimStart(' \n  q w e \n  '), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(trimStart(WHITESPACES), '', 'removes all whitespaces');
  assert.strictEqual(trimStart('\u200b\u0085'), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimStart(null, 0), TypeError);
    assert.throws(() => trimStart(undefined, 0), TypeError);
  }
});
