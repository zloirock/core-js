import { STRICT } from '../helpers/constants.js';

QUnit.test('String#at', assert => {
  const { at } = String.prototype;
  assert.isFunction(at);
  assert.arity(at, 1);
  assert.name(at, 'at');
  assert.looksNative(at);
  assert.nonEnumerable(String.prototype, 'at');

  assert.same('123'.at(0), '1');
  assert.same('123'.at(1), '2');
  assert.same('123'.at(2), '3');
  assert.same('123'.at(3), undefined);
  assert.same('123'.at(-1), '3');
  assert.same('123'.at(-2), '2');
  assert.same('123'.at(-3), '1');
  assert.same('123'.at(-4), undefined);
  assert.same('123'.at(0.4), '1');
  assert.same('123'.at(0.5), '1');
  assert.same('123'.at(0.6), '1');
  assert.same('1'.at(NaN), '1');
  assert.same('1'.at(), '1');
  assert.same('123'.at(-0), '1');
  assert.same('𠮷'.at(), '\uD842');
  assert.same(at.call({ toString() { return '123'; } }, 0), '1');

  assert.throws(() => at.call(Symbol('at test'), 0), 'throws on symbol context');

  if (STRICT) {
    assert.throws(() => at.call(null, 0), TypeError);
    assert.throws(() => at.call(undefined, 0), TypeError);
  }
});
