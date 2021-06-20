/* eslint-disable unicorn/prefer-string-slice -- required for testing */
import { STRICT } from '../helpers/constants';

QUnit.test('String#substr', assert => {
  const { substr } = String.prototype;
  assert.isFunction(substr);
  assert.arity(substr, 2);
  assert.name(substr, 'substr');
  assert.looksNative(substr);
  assert.nonEnumerable(String.prototype, 'substr');

  assert.same('12345'.substr(1, 3), '234');

  if (STRICT) {
    assert.throws(() => substr.call(null, 1, 3), TypeError, 'Throws on null as `this`');
    assert.throws(() => substr.call(undefined, 1, 3), TypeError, 'Throws on undefined as `this`');
  }
});
