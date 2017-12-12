QUnit.test('Set.of', assert => {
  const { Set } = core;
  const { of } = Set;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.ok(Set.of() instanceof Set);
  assert.deepEqual(core.Array.from(Set.of(1)), [1]);
  assert.deepEqual(core.Array.from(Set.of(1, 2, 3, 2, 1)), [1, 2, 3]);
  assert.throws(() => of(1));
  let arg = null;
  function F(it) {
    return arg = it;
  }
  of.call(F, 1, 2, 3);
  assert.deepEqual(arg, [1, 2, 3]);
});
