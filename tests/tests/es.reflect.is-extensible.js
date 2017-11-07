var test = QUnit.test;

test('Reflect.isExtensible', function (assert) {
  var isExtensible = Reflect.isExtensible;
  var preventExtensions = Object.preventExtensions;
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  assert.name(isExtensible, 'isExtensible');
  assert.looksNative(isExtensible);
  assert.nonEnumerable(Reflect, 'isExtensible');
  assert.ok(isExtensible({}));
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(preventExtensions({})));
  }
  assert['throws'](function () {
    isExtensible(42);
  }, TypeError, 'throws on primitive');
});

