import isFrozen from 'core-js-pure/es/object/is-frozen';

QUnit.test('Object.isFrozen', assert => {
  assert.isFunction(isFrozen);
  assert.arity(isFrozen, 1);
  assert.name(isFrozen, 'isFrozen');
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.returns(() => isFrozen(value), true, `returns true on ${ value }`);
  }
  assert.false(isFrozen({}));
});
