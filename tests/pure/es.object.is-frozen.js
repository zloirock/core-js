import isFrozen from 'core-js-pure/full/object/is-frozen';

QUnit.test('Object.isFrozen', assert => {
  assert.isFunction(isFrozen);
  assert.arity(isFrozen, 1);
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.notThrows(() => isFrozen(value) || true, `accept ${ value }`);
    assert.same(isFrozen(value), true, `returns true on ${ value }`);
  }
  assert.same(isFrozen({}), false);
});
