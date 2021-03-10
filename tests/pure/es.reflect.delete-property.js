import deleteProperty from 'core-js-pure/full/reflect/delete-property';
import { defineProperty, keys } from 'core-js-pure/full/object';

QUnit.test('Reflect.deleteProperty', assert => {
  assert.isFunction(deleteProperty);
  assert.arity(deleteProperty, 2);
  if ('name' in deleteProperty) {
    assert.name(deleteProperty, 'deleteProperty');
  }
  const object = { bar: 456 };
  assert.strictEqual(deleteProperty(object, 'bar'), true);
  assert.ok(keys(object).length === 0);
  assert.strictEqual(deleteProperty(defineProperty({}, 'foo', {
    value: 42,
  }), 'foo'), false);
  assert.throws(() => deleteProperty(42, 'foo'), TypeError, 'throws on primitive');
});
