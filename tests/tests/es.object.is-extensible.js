import { NATIVE } from '../helpers/constants';

QUnit.test('Object.isExtensible', assert => {
  const { preventExtensions, isExtensible } = Object;
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  assert.name(isExtensible, 'isExtensible');
  assert.nonEnumerable(Object, 'isExtensible');
  assert.looksNative(isExtensible);
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.ok((() => {
      try {
        isExtensible(value);
        return true;
      } catch (e) { /* empty */ }
    })(), `accept ${ value }`);
    assert.same(isExtensible(value), false, `returns true on ${ value }`);
  }
  assert.same(isExtensible({}), true);
  if (NATIVE) assert.ok(!isExtensible(preventExtensions({})));
});

