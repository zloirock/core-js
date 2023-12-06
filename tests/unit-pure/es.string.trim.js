import { WHITESPACES } from '../helpers/constants.js';

import trim from '@core-js/pure/es/string/trim';

QUnit.test('String#trim', assert => {
  assert.isFunction(trim);
  assert.same(trim(' \n  q w e \n  '), 'q w e', 'removes whitespaces at left & right side of string');
  assert.same(trim(WHITESPACES), '', 'removes all whitespaces');
  assert.same(trim('\u200B\u0085'), '\u200B\u0085', "shouldn't remove this symbols");

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    assert.throws(() => trim(Symbol('trim test')), 'throws on symbol context');
  }

  assert.throws(() => trim(null, 0), TypeError);
  assert.throws(() => trim(undefined, 0), TypeError);
});
