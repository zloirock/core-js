import getOwnPropertyDescriptor from '@core-js/pure/es/object/get-own-property-descriptor';
import create from '@core-js/pure/es/object/create';
import defineProperty from '@core-js/pure/es/reflect/define-property';

QUnit.test('Reflect.defineProperty', assert => {
  assert.isFunction(defineProperty);
  assert.arity(defineProperty, 3);
  if ('name' in defineProperty) {
    assert.name(defineProperty, 'defineProperty');
  }
  let object = {};
  assert.true(defineProperty(object, 'foo', { value: 123 }));
  assert.same(object.foo, 123);

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
  assert.false(defineProperty(object, 'foo', {
    value: 42,
  }));

  assert.throws(() => defineProperty(42, 'foo', {
    value: 42,
  }), TypeError, 'throws on primitive');
  assert.throws(() => defineProperty(42, 1, {}));
  assert.throws(() => defineProperty({}, create(null), {}));
  assert.throws(() => defineProperty({}, 1, 1));
});
