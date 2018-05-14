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
  assert.strictEqual(deleteProperty(object, 'bar'), true);
  assert.ok(keys(object).length === 0);
  if (DESCRIPTORS) {
    assert.strictEqual(deleteProperty(defineProperty({}, 'foo', {
      value: 42,
    }), 'foo'), false);
  }
  assert.throws(() => deleteProperty(42, 'foo'), TypeError, 'throws on primitive');
});
