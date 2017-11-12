QUnit.test('Reflect.getOwnPropertyDescriptor', function (assert) {
  var getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
  assert.isFunction(getOwnPropertyDescriptor);
  assert.arity(getOwnPropertyDescriptor, 2);
  assert.name(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
  assert.looksNative(getOwnPropertyDescriptor);
  assert.nonEnumerable(Reflect, 'getOwnPropertyDescriptor');
  var object = { baz: 789 };
  var descriptor = getOwnPropertyDescriptor(object, 'baz');
  assert.strictEqual(descriptor.value, 789);
  assert['throws'](function () {
    getOwnPropertyDescriptor(42, 'constructor');
  }, TypeError, 'throws on primitive');
});
