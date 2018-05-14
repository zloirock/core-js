import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Array.of', assert => {
  const { defineProperty } = Object;
  assert.isFunction(Array.of);
  assert.arity(Array.of, 0);
  assert.name(Array.of, 'of');
  assert.looksNative(Array.of);
  assert.nonEnumerable(Array, 'of');
  assert.deepEqual(Array.of(1), [1]);
  assert.deepEqual(Array.of(1, 2, 3), [1, 2, 3]);
  class C { /* empty */ }
  const instance = Array.of.call(C, 1, 2);
  assert.ok(instance instanceof C);
  assert.strictEqual(instance[0], 1);
  assert.strictEqual(instance[1], 2);
  assert.strictEqual(instance.length, 2);
  if (DESCRIPTORS) {
    let called = false;
    defineProperty(C.prototype, 0, {
      set() {
        called = true;
      },
    });
    Array.of.call(C, 1, 2, 3);
    assert.ok(!called, 'Should not call prototype accessors');
  }
});
