import substr from '@core-js/pure/es/string/substr';
import { STRICT } from '../helpers/constants.js';

QUnit.test('String#substr', assert => {
  assert.isFunction(substr);

  assert.same(substr('12345', 1, 3), '234');

  assert.same(substr('ab', -1), 'b');

  assert.same(substr('hello', Infinity), '', 'Infinity start returns empty string');
  assert.same(substr('hello', 1, Infinity), 'ello', 'Infinity length returns rest of string');
  assert.same(substr('hello', -Infinity), 'hello', '-Infinity start treated as 0');
  assert.same(substr('hello', 0, -1), '', 'negative length returns empty string');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    assert.throws(() => substr(Symbol('substr test'), 1, 3), 'throws on symbol context');
  }

  if (STRICT) {
    assert.throws(() => substr(null, 1, 3), TypeError, 'Throws on null as `this`');
    assert.throws(() => substr(undefined, 1, 3), TypeError, 'Throws on undefined as `this`');
  }
});
