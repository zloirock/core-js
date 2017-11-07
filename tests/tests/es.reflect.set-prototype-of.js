var test = QUnit.test;
if (PROTO) {
  test('Reflect.setPrototypeOf', function (assert) {
    var setPrototypeOf = Reflect.setPrototypeOf;
    assert.isFunction(setPrototypeOf);
    NATIVE && assert.arity(setPrototypeOf, 2);
    assert.name(setPrototypeOf, 'setPrototypeOf');
    assert.looksNative(setPrototypeOf);
    assert.nonEnumerable(Reflect, 'setPrototypeOf');
    var object = {};
    assert.ok(setPrototypeOf(object, Array.prototype), true);
    assert.ok(object instanceof Array);
    assert['throws'](function () {
      setPrototypeOf({}, 42);
    }, TypeError);
    assert['throws'](function () {
      setPrototypeOf(42, {});
    }, TypeError, 'throws on primitive');
    object = {};
    assert.ok(setPrototypeOf(object, object) === false, 'false on recursive __proto__');
  });
}
