import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.getOwnPropertyDescriptor', assert => {
  const { getOwnPropertyDescriptor } = Reflect;
  assert.isFunction(getOwnPropertyDescriptor);
  assert.arity(getOwnPropertyDescriptor, 2);
  assert.name(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
  assert.looksNative(getOwnPropertyDescriptor);
  assert.nonEnumerable(Reflect, 'getOwnPropertyDescriptor');
  const object = { baz: 789 };
  const descriptor = getOwnPropertyDescriptor(object, 'baz');
  assert.strictEqual(descriptor.value, 789);
  assert.throws(() => getOwnPropertyDescriptor(42, 'constructor'), TypeError, 'throws on primitive');
});

QUnit.test('Reflect.getOwnPropertyDescriptor.sham flag', assert => {
  assert.same(Reflect.getOwnPropertyDescriptor.sham, DESCRIPTORS ? undefined : true);
});
