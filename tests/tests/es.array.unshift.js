import { DESCRIPTORS, STRICT } from '../helpers/constants';

const { defineProperty } = Object;

QUnit.test('Array#unshift', assert => {
  const { unshift } = Array.prototype;
  assert.isFunction(unshift);
  assert.arity(unshift, 1);
  assert.name(unshift, 'unshift');
  assert.looksNative(unshift);
  assert.nonEnumerable(Array.prototype, 'unshift');

  assert.same(unshift.call([1], 0), 2, 'proper result');

  if (DESCRIPTORS) {
    assert.throws(() => unshift.call(defineProperty([], 'length', { writable: false }), 1), TypeError, 'now-writable length, with arg');
    assert.throws(() => unshift.call(defineProperty([], 'length', { writable: false })), TypeError, 'now-writable length, without arg');
  }

  if (STRICT) {
    assert.throws(() => unshift.call(null), TypeError);
    assert.throws(() => unshift.call(undefined), TypeError);
  }
});
