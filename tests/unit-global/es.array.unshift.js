import { REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR } from '../helpers/constants.js';

const { defineProperty } = Object;

QUnit.test('Array#unshift', assert => {
  const { unshift } = Array.prototype;
  assert.isFunction(unshift);
  assert.arity(unshift, 1);
  assert.name(unshift, 'unshift');
  assert.looksNative(unshift);
  assert.nonEnumerable(Array.prototype, 'unshift');

  assert.same(unshift.call([1], 0), 2, 'proper result');

  if (REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR) {
    assert.throws(() => unshift.call(defineProperty([], 'length', { writable: false }), 1), TypeError, 'non-writable length, with arg');
    assert.throws(() => unshift.call(defineProperty([], 'length', { writable: false })), TypeError, 'non-writable length, without arg');
  }

  assert.throws(() => unshift.call(null), TypeError);
  assert.throws(() => unshift.call(undefined), TypeError);
});
