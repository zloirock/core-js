import { NATIVE } from '../helpers/constants';

QUnit.test('Object.isFrozen', assert => {
  const { freeze, isFrozen } = Object;
  assert.isFunction(isFrozen);
  assert.arity(isFrozen, 1);
  assert.name(isFrozen, 'isFrozen');
  assert.looksNative(isFrozen);
  assert.nonEnumerable(Object, 'isFrozen');
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.notThrows(() => isFrozen(value) || true, `accept ${ value }`);
    assert.same(isFrozen(value), true, `returns true on ${ value }`);
  }
  assert.same(isFrozen({}), false);
  if (NATIVE) assert.ok(isFrozen(freeze({})));
});
