import { STRICT, WHITESPACES } from '../helpers/constants';

import { trimLeft } from 'core-js-pure/features/string';

QUnit.test('String#trimLeft', assert => {
  assert.isFunction(trimLeft);
  assert.strictEqual(trimLeft(' \n  q w e \n  '), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(trimLeft(WHITESPACES), '', 'removes all whitespaces');
  assert.strictEqual(trimLeft('\u200B\u0085'), '\u200B\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimLeft(null, 0), TypeError);
    assert.throws(() => trimLeft(undefined, 0), TypeError);
  }
});
