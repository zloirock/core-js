import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.deleteProperty', function (assert) {
  var deleteProperty = Reflect.deleteProperty;
  var defineProperty = Object.defineProperty;
  var keys = Object.keys;
  assert.isFunction(deleteProperty);
  assert.arity(deleteProperty, 2);
  assert.name(deleteProperty, 'deleteProperty');
  assert.looksNative(deleteProperty);
  assert.nonEnumerable(Reflect, 'deleteProperty');
  var object = { bar: 456 };
  assert.strictEqual(deleteProperty(object, 'bar'), true);
  assert.ok(keys(object).length === 0);
  if (DESCRIPTORS) {
    assert.strictEqual(deleteProperty(defineProperty({}, 'foo', {
      value: 42
    }), 'foo'), false);
  }
  assert['throws'](function () {
    deleteProperty(42, 'foo');
  }, TypeError, 'throws on primitive');
});
