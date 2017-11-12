import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.defineProperty', function (assert) {
  var defineProperty = Reflect.defineProperty;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var create = Object.create;
  assert.isFunction(defineProperty);
  assert.arity(defineProperty, 3);
  assert.name(defineProperty, 'defineProperty');
  assert.looksNative(defineProperty);
  assert.nonEnumerable(Reflect, 'defineProperty');
  var object = {};
  assert.strictEqual(defineProperty(object, 'foo', { value: 123 }), true);
  assert.strictEqual(object.foo, 123);
  if (DESCRIPTORS) {
    object = {};
    defineProperty(object, 'foo', {
      value: 123,
      enumerable: true
    });
    assert.deepEqual(getOwnPropertyDescriptor(object, 'foo'), {
      value: 123,
      enumerable: true,
      configurable: false,
      writable: false
    });
    assert.strictEqual(defineProperty(object, 'foo', {
      value: 42
    }), false);
  }
  assert.throws(function () {
    defineProperty(42, 'foo', {
      value: 42
    });
  }, TypeError, 'throws on primitive');
  assert.throws(function () {
    defineProperty(42, 1, {});
  });
  assert.throws(function () {
    defineProperty({}, create(null), {});
  });
  assert.throws(function () {
    defineProperty({}, 1, 1);
  });
});

