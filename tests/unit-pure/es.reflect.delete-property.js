import keys from '@core-js/pure/es/object/keys';
import defineProperty from '@core-js/pure/es/object/define-property';
import deleteProperty from '@core-js/pure/es/reflect/delete-property';

QUnit.test('Reflect.deleteProperty', assert => {
  assert.isFunction(deleteProperty);
  assert.arity(deleteProperty, 2);
  if ('name' in deleteProperty) {
    assert.name(deleteProperty, 'deleteProperty');
  }
  const object = { bar: 456 };
  assert.true(deleteProperty(object, 'bar'));
  assert.same(keys(object).length, 0);

  assert.false(deleteProperty(defineProperty({}, 'foo', {
    value: 42,
  }), 'foo'));

  assert.throws(() => deleteProperty(42, 'foo'), TypeError, 'throws on primitive');
});
