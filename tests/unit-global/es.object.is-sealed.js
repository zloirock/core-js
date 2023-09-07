import { NATIVE } from '../helpers/constants.js';

QUnit.test('Object.isSealed', assert => {
  const { seal, isSealed } = Object;
  assert.isFunction(isSealed);
  assert.arity(isSealed, 1);
  assert.name(isSealed, 'isSealed');
  assert.looksNative(isSealed);
  assert.nonEnumerable(Object, 'isSealed');
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.notThrows(() => isSealed(value) || true, `accept ${ value }`);
    assert.true(isSealed(value), `returns true on ${ value }`);
  }
  assert.false(isSealed({}));
  if (NATIVE) assert.true(isSealed(seal({})));
});
