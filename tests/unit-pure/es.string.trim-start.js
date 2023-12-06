import { WHITESPACES } from '../helpers/constants.js';

import Symbol from '@core-js/pure/es/symbol';
import trimStart from '@core-js/pure/es/string/trim-start';

QUnit.test('String#trimStart', assert => {
  assert.isFunction(trimStart);
  assert.same(trimStart(' \n  q w e \n  '), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.same(trimStart(WHITESPACES), '', 'removes all whitespaces');
  assert.same(trimStart('\u200B\u0085'), '\u200B\u0085', "shouldn't remove this symbols");

  assert.throws(() => trimStart(Symbol('trimStart test')), 'throws on symbol context');

  assert.throws(() => trimStart(null, 0), TypeError);
  assert.throws(() => trimStart(undefined, 0), TypeError);
});
