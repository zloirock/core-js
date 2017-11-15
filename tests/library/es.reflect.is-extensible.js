import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.isExtensible', assert => {
  const { isExtensible } = core.Reflect;
  const { preventExtensions } = core.Object;
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  if ('name' in isExtensible) {
    assert.name(isExtensible, 'isExtensible');
  }
  assert.ok(isExtensible({}));
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(preventExtensions({})));
  }
  assert.throws(() => {
    return isExtensible(42);
  }, TypeError, 'throws on primitive');
});
