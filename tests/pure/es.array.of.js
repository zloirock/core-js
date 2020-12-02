import of from 'core-js-pure/features/array/of';
import defineProperty from 'core-js-pure/features/object/define-property';

QUnit.test('Array.of', assert => {
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.deepEqual(of(1), [1]);
  assert.deepEqual(of(1, 2, 3), [1, 2, 3]);
  class C { /* empty */ }
  const instance = of.call(C, 1, 2);
  assert.ok(instance instanceof C);
  assert.strictEqual(instance[0], 1);
  assert.strictEqual(instance[1], 2);
  assert.strictEqual(instance.length, 2);
  let called = false;
  defineProperty(C.prototype, 0, {
    set() {
      called = true;
    },
  });
  of.call(C, 1, 2, 3);
  assert.ok(!called, 'Should not call prototype accessors');
});
