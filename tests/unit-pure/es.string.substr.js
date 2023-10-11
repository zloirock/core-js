import substr from '@core-js/pure/es/string/substr';
import { STRICT } from '../helpers/constants.js';

QUnit.test('String#substr', assert => {
  assert.isFunction(substr);

  assert.same(substr('12345', 1, 3), '234');

  assert.same(substr('ab', -1), 'b');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    assert.throws(() => substr(Symbol('substr test'), 1, 3), 'throws on symbol context');
  }

  if (STRICT) {
    assert.throws(() => substr(null, 1, 3), TypeError, 'Throws on null as `this`');
    assert.throws(() => substr(undefined, 1, 3), TypeError, 'Throws on undefined as `this`');
  }
});
