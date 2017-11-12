QUnit.test('Reflect.getOwnPropertyDescriptor', function (assert) {
  var getOwnPropertyDescriptor = core.Reflect.getOwnPropertyDescriptor;
  assert.isFunction(getOwnPropertyDescriptor);
  assert.arity(getOwnPropertyDescriptor, 2);
  if ('name' in getOwnPropertyDescriptor) {
    assert.name(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
  }
  var object = { baz: 789 };
  var descriptor = getOwnPropertyDescriptor(object, 'baz');
  assert.strictEqual(descriptor.value, 789);
  assert.throws(function () {
    getOwnPropertyDescriptor(42, 'constructor');
  }, TypeError, 'throws on primitive');
});
