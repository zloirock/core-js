import { STRICT, WHITESPACES } from '../helpers/constants';

import Symbol from 'core-js-pure/es/symbol';
import trimRight from 'core-js-pure/es/string/trim-right';
import trimEnd from 'core-js-pure/es/string/trim-end';

QUnit.test('String#trimRight', assert => {
  assert.isFunction(trimRight);
  assert.same(trimRight(' \n  q w e \n  '), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.same(trimRight(WHITESPACES), '', 'removes all whitespaces');
  assert.same(trimRight('\u200B\u0085'), '\u200B\u0085', "shouldn't remove this symbols");

  assert.throws(() => trimRight(Symbol()), 'throws on symbol context');

  if (STRICT) {
    assert.throws(() => trimRight(null, 0), TypeError);
    assert.throws(() => trimRight(undefined, 0), TypeError);
  }
});

QUnit.test('String#trimEnd', assert => {
  assert.isFunction(trimEnd);
  assert.same(trimEnd(' \n  q w e \n  '), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.same(trimEnd(WHITESPACES), '', 'removes all whitespaces');
  assert.same(trimEnd('\u200B\u0085'), '\u200B\u0085', "shouldn't remove this symbols");

  assert.throws(() => trimEnd(Symbol()), 'throws on symbol context');

  if (STRICT) {
    assert.throws(() => trimEnd(null, 0), TypeError);
    assert.throws(() => trimEnd(undefined, 0), TypeError);
  }
});
