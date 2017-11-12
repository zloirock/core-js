import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.preventExtensions', function (assert) {
  var preventExtensions = core.Reflect.preventExtensions;
  var isExtensible = core.Object.isExtensible;
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  if ('name' in preventExtensions) {
    assert.name(preventExtensions, 'preventExtensions');
  }
  var object = {};
  assert.ok(preventExtensions(object), true);
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(object));
  }
  assert.throws(function () {
    preventExtensions(42);
  }, TypeError, 'throws on primitive');
});
