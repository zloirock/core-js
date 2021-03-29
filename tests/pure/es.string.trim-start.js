import { STRICT, WHITESPACES } from '../helpers/constants';

import { trimStart } from 'core-js-pure/full/string';

QUnit.test('String#trimStart', assert => {
  assert.isFunction(trimStart);
  assert.strictEqual(trimStart(' \n  q w e \n  '), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(trimStart(WHITESPACES), '', 'removes all whitespaces');
  assert.strictEqual(trimStart('\u200B\u0085'), '\u200B\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimStart(null, 0), TypeError);
    assert.throws(() => trimStart(undefined, 0), TypeError);
  }
});
