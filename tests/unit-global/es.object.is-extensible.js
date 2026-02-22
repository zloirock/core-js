import { NATIVE } from '../helpers/constants.js';

QUnit.test('Object.isExtensible', assert => {
  const { preventExtensions, isExtensible } = Object;
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  assert.name(isExtensible, 'isExtensible');
  assert.nonEnumerable(Object, 'isExtensible');
  assert.looksNative(isExtensible);
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.notThrows(() => isExtensible(value) || true, `accept ${ value }`);
    assert.false(isExtensible(value), `returns false on ${ value }`);
  }
  assert.true(isExtensible({}));
  if (NATIVE) assert.false(isExtensible(preventExtensions({})));
});

