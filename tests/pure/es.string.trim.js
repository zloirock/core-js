import { STRICT, WHITESPACES } from '../helpers/constants';

import trim from 'core-js-pure/fn/string/trim';

QUnit.test('String#trim', assert => {
  assert.isFunction(trim);
  assert.strictEqual(trim(' \n  q w e \n  '), 'q w e', 'removes whitespaces at left & right side of string');
  assert.strictEqual(trim(WHITESPACES), '', 'removes all whitespaces');
  assert.strictEqual(trim('\u200b\u0085'), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trim(null, 0), TypeError);
    assert.throws(() => trim(undefined, 0), TypeError);
  }
});
