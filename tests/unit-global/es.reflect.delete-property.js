import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Reflect.deleteProperty', assert => {
  const { deleteProperty } = Reflect;
  const { defineProperty, keys } = Object;
  assert.isFunction(deleteProperty);
  assert.arity(deleteProperty, 2);
  assert.name(deleteProperty, 'deleteProperty');
  assert.looksNative(deleteProperty);
  assert.nonEnumerable(Reflect, 'deleteProperty');
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
