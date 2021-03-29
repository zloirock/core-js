import { STRICT, WHITESPACES } from '../helpers/constants';

import { trimEnd } from 'core-js-pure/full/string';

QUnit.test('String#trimEnd', assert => {
  assert.isFunction(trimEnd);
  assert.strictEqual(trimEnd(' \n  q w e \n  '), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.strictEqual(trimEnd(WHITESPACES), '', 'removes all whitespaces');
  assert.strictEqual(trimEnd('\u200B\u0085'), '\u200B\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trimEnd(null, 0), TypeError);
    assert.throws(() => trimEnd(undefined, 0), TypeError);
  }
});
