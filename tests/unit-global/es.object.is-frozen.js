import { NATIVE } from '../helpers/constants.js';

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
    assert.true(isFrozen(value), `returns true on ${ value }`);
  }
  assert.false(isFrozen({}));
  if (NATIVE) assert.true(isFrozen(freeze({})));
});
