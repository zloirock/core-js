import { STRICT, WHITESPACES } from '../helpers/constants.js';

import Symbol from '@core-js/pure/es/symbol';
import trimRight from '@core-js/pure/es/string/trim-right';

QUnit.test('String#trimRight', assert => {
  assert.isFunction(trimRight);
  assert.same(trimRight(' \n  q w e \n  '), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.same(trimRight(WHITESPACES), '', 'removes all whitespaces');
  assert.same(trimRight('\u200B\u0085'), '\u200B\u0085', "shouldn't remove this symbols");

  assert.throws(() => trimRight(Symbol('trimRight test')), 'throws on symbol context');

  if (STRICT) {
    assert.throws(() => trimRight(null, 0), TypeError);
    assert.throws(() => trimRight(undefined, 0), TypeError);
  }
});
