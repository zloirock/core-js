import { REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR, STRICT } from '../helpers/constants.js';

const { defineProperty } = Object;

QUnit.test('Array#push', assert => {
  const { push } = Array.prototype;
  assert.isFunction(push);
  assert.arity(push, 1);
  assert.name(push, 'push');
  assert.looksNative(push);
  assert.nonEnumerable(Array.prototype, 'push');

  const object = { length: 0x100000000 };
  assert.same(push.call(object, 1), 0x100000001, 'proper ToLength #1');
  assert.same(object[0x100000000], 1, 'proper ToLength #2');

  const array = [1];
  assert.same(push.call(array, 2, 3), 3, 'some arguments, result');
  assert.arrayEqual(array, [1, 2, 3], 'some arguments, content');
  assert.same(push.call(array), 3, 'without arguments, result');
  assert.arrayEqual(array, [1, 2, 3], 'without arguments, content');

  const arrayLike = { 0: 1, length: 1 };
  assert.same(push.call(arrayLike, 2, 3), 3, 'array-like, result');
  assert.deepEqual(arrayLike, { 0: 1, 1: 2, 2: 3, length: 3 }, 'array-like, content');

  const empty = {};
  assert.same(push.call(empty, 1), 1, 'object without length, result');
  assert.deepEqual(empty, { 0: 1, length: 1 }, 'object without length, content');

  if (STRICT) {
    if (REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR) {
      assert.throws(() => push.call(defineProperty([], 'length', { writable: false }), 1), TypeError, 'non-writable length, with arg');
      assert.throws(() => push.call(defineProperty([], 'length', { writable: false })), TypeError, 'non-writable length, without arg');
    }

    assert.throws(() => push.call(null), TypeError);
    assert.throws(() => push.call(undefined), TypeError);
  }
});
