import { WHITESPACES } from '../helpers/constants.js';

import Symbol from '@core-js/pure/es/symbol';
import trimLeft from '@core-js/pure/es/string/trim-left';

QUnit.test('String#trimLeft', assert => {
  assert.isFunction(trimLeft);
  assert.same(trimLeft(' \n  q w e \n  '), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.same(trimLeft(WHITESPACES), '', 'removes all whitespaces');
  assert.same(trimLeft('\u200B\u0085'), '\u200B\u0085', "shouldn't remove this symbols");

  assert.throws(() => trimLeft(Symbol('trimLeft test')), 'throws on symbol context');

  assert.throws(() => trimLeft(null, 0), TypeError);
  assert.throws(() => trimLeft(undefined, 0), TypeError);
});
