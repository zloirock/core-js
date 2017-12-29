import WeakSet from '../../ponyfill/fn/weak-set';

QUnit.test('WeakSet.of', assert => {
  const { of } = WeakSet;
  assert.isFunction(of);
  assert.arity(of, 0);
  const array = [];
  assert.ok(WeakSet.of() instanceof WeakSet);
  assert.ok(WeakSet.of(array).has(array));
  assert.throws(() => of(1));
  let arg = null;
  function F(it) {
    arg = it;
  }
  of.call(F, 1, 2, 3);
  assert.deepEqual(arg, [1, 2, 3]);
});
