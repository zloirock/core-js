import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.preventExtensions', assert => {
  const { preventExtensions } = Reflect;
  const { isExtensible } = Object;
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  assert.name(preventExtensions, 'preventExtensions');
  assert.looksNative(preventExtensions);
  assert.nonEnumerable(Reflect, 'preventExtensions');
  const object = {};
  assert.ok(preventExtensions(object), true);
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(object));
  }
  assert.throws(() => {
    return preventExtensions(42);
  }, TypeError, 'throws on primitive');
});
