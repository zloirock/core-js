QUnit.test('Reflect.getPrototypeOf', function (assert) {
  var getPrototypeOf = core.Reflect.getPrototypeOf;
  assert.isFunction(getPrototypeOf);
  assert.arity(getPrototypeOf, 1);
  if ('name' in getPrototypeOf) {
    assert.name(getPrototypeOf, 'getPrototypeOf');
  }
  assert.strictEqual(getPrototypeOf([]), Array.prototype);
  assert.throws(function () {
    getPrototypeOf(42);
  }, TypeError, 'throws on primitive');
});
