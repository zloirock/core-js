import { STRICT } from '../helpers/constants.js';

QUnit.test('String#substr', assert => {
  const { substr } = String.prototype;
  assert.isFunction(substr);
  assert.arity(substr, 2);
  assert.name(substr, 'substr');
  assert.looksNative(substr);
  assert.nonEnumerable(String.prototype, 'substr');

  assert.same('12345'.substr(1, 3), '234');

  assert.same('ab'.substr(-1), 'b');

  assert.same('hello'.substr(Infinity), '', 'Infinity start returns empty string');
  assert.same('hello'.substr(1, Infinity), 'ello', 'Infinity length returns rest of string');
  assert.same('hello'.substr(-Infinity), 'hello', '-Infinity start treated as 0');
  assert.same('hello'.substr(0, -1), '', 'negative length returns empty string');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => substr.call(Symbol('substr test'), 1, 3), 'throws on symbol context');
  }

  if (STRICT) {
    assert.throws(() => substr.call(null, 1, 3), TypeError, 'Throws on null as `this`');
    assert.throws(() => substr.call(undefined, 1, 3), TypeError, 'Throws on undefined as `this`');
  }
});
