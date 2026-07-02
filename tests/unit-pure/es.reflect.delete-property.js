import { createConversionChecker } from '../helpers/helpers.js';

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

  // ToPropertyKey should be called exactly once
  const keyObj = createConversionChecker(1, 'bar');
  deleteProperty({ bar: 1 }, keyObj);
  assert.same(keyObj.$valueOf, 0, 'ToPropertyKey called once in Reflect.deleteProperty, #1');
  assert.same(keyObj.$toString, 1, 'ToPropertyKey called once in Reflect.deleteProperty, #2');

  // argument order: target should be validated before ToPropertyKey
  const orderChecker = createConversionChecker(1, 'qux');
  assert.throws(() => deleteProperty(42, orderChecker), TypeError, 'throws on primitive before ToPropertyKey');
  assert.same(orderChecker.$toString, 0, 'ToPropertyKey not called before target validation in Reflect.deleteProperty');
});
