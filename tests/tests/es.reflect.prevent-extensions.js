import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.preventExtensions', function (assert) {
  var preventExtensions = Reflect.preventExtensions;
  var isExtensible = Object.isExtensible;
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  assert.name(preventExtensions, 'preventExtensions');
  assert.looksNative(preventExtensions);
  assert.nonEnumerable(Reflect, 'preventExtensions');
  var object = {};
  assert.ok(preventExtensions(object), true);
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(object));
  }
  assert['throws'](function () {
    preventExtensions(42);
  }, TypeError, 'throws on primitive');
});
