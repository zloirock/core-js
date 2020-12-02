import { FREEZING } from '../helpers/constants';

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
  assert.ok(!isExtensible(object));
  assert.throws(() => preventExtensions(42), TypeError, 'throws on primitive');
});

QUnit.test('Reflect.preventExtensions.sham flag', assert => {
  assert.same(Reflect.preventExtensions.sham, FREEZING ? undefined : true);
});
