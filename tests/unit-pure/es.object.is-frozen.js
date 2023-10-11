import isFrozen from '@core-js/pure/es/object/is-frozen';

QUnit.test('Object.isFrozen', assert => {
  assert.isFunction(isFrozen);
  assert.arity(isFrozen, 1);
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.notThrows(() => isFrozen(value) || true, `accept ${ value }`);
    assert.true(isFrozen(value), `returns true on ${ value }`);
  }
  assert.false(isFrozen({}));
});
