import { DESCRIPTORS } from '../helpers/constants';

import deleteProperty from 'core-js-pure/features/reflect/delete-property';
import { defineProperty, keys } from 'core-js-pure/features/object';

QUnit.test('Reflect.deleteProperty', assert => {
  assert.isFunction(deleteProperty);
  assert.arity(deleteProperty, 2);
  if ('name' in deleteProperty) {
    assert.name(deleteProperty, 'deleteProperty');
  }
  const object = { bar: 456 };
  assert.true(deleteProperty(object, 'bar'));
  assert.same(keys(object).length, 0);
  if (DESCRIPTORS) {
    assert.false(deleteProperty(defineProperty({}, 'foo', {
      value: 42,
    }), 'foo'));
  }
  assert.throws(() => deleteProperty(42, 'foo'), TypeError, 'throws on primitive');
});
