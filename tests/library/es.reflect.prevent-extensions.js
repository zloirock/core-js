import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.preventExtensions', assert => {
  const { preventExtensions } = core.Reflect;
  const { isExtensible } = core.Object;
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  if ('name' in preventExtensions) {
    assert.name(preventExtensions, 'preventExtensions');
  }
  const object = {};
  assert.ok(preventExtensions(object), true);
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(object));
  }
  assert.throws(() => {
    return preventExtensions(42);
  }, TypeError, 'throws on primitive');
});
