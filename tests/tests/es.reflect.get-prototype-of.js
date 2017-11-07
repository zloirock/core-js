var test = QUnit.test;

test('Reflect.getPrototypeOf', function (assert) {
  var getPrototypeOf = Reflect.getPrototypeOf;
  assert.isFunction(getPrototypeOf);
  assert.arity(getPrototypeOf, 1);
  assert.name(getPrototypeOf, 'getPrototypeOf');
  assert.looksNative(getPrototypeOf);
  assert.nonEnumerable(Reflect, 'getPrototypeOf');
  assert.strictEqual(getPrototypeOf([]), Array.prototype);
  assert['throws'](function () {
    getPrototypeOf(42);
  }, TypeError, 'throws on primitive');
});
