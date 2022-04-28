import { DESCRIPTORS, STRICT } from '../helpers/constants';

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

  if (DESCRIPTORS) {
    assert.throws(() => push.call(defineProperty([], 'length', { writable: false }), 1), TypeError, 'now-writable length, with arg');
    assert.throws(() => push.call(defineProperty([], 'length', { writable: false })), TypeError, 'now-writable length, without arg');
  }

  if (STRICT) {
    assert.throws(() => push.call(null), TypeError);
    assert.throws(() => push.call(undefined), TypeError);
  }
});
