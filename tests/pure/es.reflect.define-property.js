import { DESCRIPTORS } from '../helpers/constants';

import defineProperty from 'core-js-pure/features/reflect/define-property';
import { getOwnPropertyDescriptor, create } from 'core-js-pure/features/object';

QUnit.test('Reflect.defineProperty', assert => {
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
  assert.throws(() => defineProperty(42, 'foo', {
    value: 42,
  }), TypeError, 'throws on primitive');
  assert.throws(() => defineProperty(42, 1, {}));
  assert.throws(() => defineProperty({}, create(null), {}));
  assert.throws(() => defineProperty({}, 1, 1));
});

QUnit.test('Reflect.defineProperty.sham flag', assert => {
  assert.same(defineProperty.sham, DESCRIPTORS ? undefined : true);
});
