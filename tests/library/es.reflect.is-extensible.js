import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Reflect.isExtensible', function (assert) {
  var isExtensible = core.Reflect.isExtensible;
  var preventExtensions = core.Object.preventExtensions;
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  if ('name' in isExtensible) {
    assert.name(isExtensible, 'isExtensible');
  }
  assert.ok(isExtensible({}));
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(preventExtensions({})));
  }
  assert.throws(function () {
    isExtensible(42);
  }, TypeError, 'throws on primitive');
});
