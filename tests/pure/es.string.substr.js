import substr from 'core-js-pure/es/string/substr';
import { STRICT } from '../helpers/constants';

QUnit.test('String#substr', assert => {
  assert.isFunction(substr);

  assert.same(substr('12345', 1, 3), '234');

  if (STRICT) {
    assert.throws(() => substr(null, 1, 3), TypeError, 'Throws on null as `this`');
    assert.throws(() => substr(undefined, 1, 3), TypeError, 'Throws on undefined as `this`');
  }
});
