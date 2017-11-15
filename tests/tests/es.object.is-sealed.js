import { NATIVE } from '../helpers/constants';

QUnit.test('Object.isSealed', assert => {
  const { seal, isSealed } = Object;
  assert.isFunction(isSealed);
  assert.arity(isSealed, 1);
  assert.name(isSealed, 'isSealed');
  assert.looksNative(isSealed);
  assert.nonEnumerable(Object, 'isSealed');
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.ok((() => {
      try {
        isSealed(value);
        return true;
      } catch (e) { /* empty */ }
    })(), `accept ${ value }`);
    assert.same(isSealed(value), true, `returns true on ${ value }`);
  }
  assert.same(isSealed({}), false);
  if (NATIVE) assert.ok(isSealed(seal({})));
});
