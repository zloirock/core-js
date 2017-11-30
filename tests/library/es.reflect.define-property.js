import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.defineProperty', assert => {
  const { defineProperty } = core.Reflect;
  const { getOwnPropertyDescriptor, create } = core.Object;
  assert.isFunction(defineProperty);
  assert.arity(defineProperty, 3);
  if ('name' in defineProperty) {
    assert.name(defineProperty, 'defineProperty');
  }
  let object = {};
  assert.strictEqual(defineProperty(object, 'foo', { value: 123 }), true);
  assert.strictEqual(object.foo, 123);
  if (DESCRIPTORS) {
    object = {};
    defineProperty(object, 'foo', {
      value: 123,
      enumerable: true,
    });
    assert.deepEqual(getOwnPropertyDescriptor(object, 'foo'), {
      value: 123,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    assert.strictEqual(defineProperty(object, 'foo', {
      value: 42,
    }), false);
  }
  assert.throws(() => {
    return defineProperty(42, 'foo', {
      value: 42,
    });
  }, TypeError, 'throws on primitive');
  assert.throws(() => {
    return defineProperty(42, 1, {});
  });
  assert.throws(() => {
    return defineProperty({}, create(null), {});
  });
  assert.throws(() => {
    return defineProperty({}, 1, 1);
  });
});
