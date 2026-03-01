import { STRICT } from '../helpers/constants.js';

import Symbol from 'core-js-pure/es/symbol';
import at from 'core-js-pure/es/string/at';

QUnit.test('String#at', assert => {
  assert.isFunction(at);
  assert.same(at('123', 0), '1');
  assert.same(at('123', 1), '2');
  assert.same(at('123', 2), '3');
  assert.same(at('123', 3), undefined);
  assert.same(at('123', -1), '3');
  assert.same(at('123', -2), '2');
  assert.same(at('123', -3), '1');
  assert.same(at('123', -4), undefined);
  assert.same(at('123', 0.4), '1');
  assert.same(at('123', 0.5), '1');
  assert.same(at('123', 0.6), '1');
  assert.same(at('1', NaN), '1');
  assert.same(at('1'), '1');
  assert.same(at('123', -0), '1');
  // TODO: disabled by default because of the conflict with old proposal
  // assert.same(at('𠮷'), '\uD842');
  assert.same(at({ toString() { return '123'; } }, 0), '1');

  assert.throws(() => at(Symbol('at-alternative test'), 0), 'throws on symbol context');

  if (STRICT) {
    assert.throws(() => at(null, 0), TypeError);
    assert.throws(() => at(undefined, 0), TypeError);
  }
});
