import defineProperty from '@core-js/pure/es/object/define-property';
import of from '@core-js/pure/es/array/of';

QUnit.test('Array.of', assert => {
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.deepEqual(of(1), [1]);
  assert.deepEqual(of(1, 2, 3), [1, 2, 3]);
  class C { /* empty */ }
  const instance = of.call(C, 1, 2);
  assert.true(instance instanceof C);
  assert.same(instance[0], 1);
  assert.same(instance[1], 2);
  assert.same(instance.length, 2);

  let called = false;
  defineProperty(C.prototype, 0, {
    set() {
      called = true;
    },
  });
  of.call(C, 1, 2, 3);
  assert.false(called, 'Should not call prototype accessors');
});
