import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.isExtensible', assert => {
  const { isExtensible } = Reflect;
  const { preventExtensions } = Object;
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  assert.name(isExtensible, 'isExtensible');
  assert.looksNative(isExtensible);
  assert.nonEnumerable(Reflect, 'isExtensible');
  assert.ok(isExtensible({}));
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(preventExtensions({})));
  }
  assert.throws(() => {
    return isExtensible(42);
  }, TypeError, 'throws on primitive');
});

