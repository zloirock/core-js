import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.deleteProperty', assert => {
  const { deleteProperty } = core.Reflect;
  const { defineProperty, keys } = core.Object;
  assert.isFunction(deleteProperty);
  assert.arity(deleteProperty, 2);
  if ('name' in deleteProperty) {
    assert.name(deleteProperty, 'deleteProperty');
  }
  const object = { bar: 456 };
  assert.strictEqual(deleteProperty(object, 'bar'), true);
  assert.ok(keys(object).length === 0);
  if (DESCRIPTORS) {
    assert.strictEqual(deleteProperty(defineProperty({}, 'foo', {
      value: 42
    }), 'foo'), false);
  }
  assert.throws(() => {
    return deleteProperty(42, 'foo');
  }, TypeError, 'throws on primitive');
});
