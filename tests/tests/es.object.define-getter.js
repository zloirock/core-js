var test = QUnit.test;

if (DESCRIPTORS) {
  test('Object#__defineGetter__', function (assert) {
    var __defineGetter__ = Object.prototype.__defineGetter__;
    assert.isFunction(__defineGetter__);
    assert.arity(__defineGetter__, 2);
    assert.name(__defineGetter__, '__defineGetter__');
    assert.looksNative(__defineGetter__);
    assert.nonEnumerable(Object.prototype, '__defineGetter__');
    var object = {};
    assert.same(object.__defineGetter__('key', function () {
      return 42;
    }), undefined, 'void');
    assert.same(object.key, 42, 'works');
    object.__defineSetter__('key', function () {
      this.foo = 43;
    });
    object.key = 44;
    assert.ok(object.key === 42 && object.foo === 43, 'works with setter');
    if (STRICT) {
      assert['throws'](function () {
        __defineGetter__(null, 1, function () { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert['throws'](function () {
        __defineGetter__(undefined, 1, function () { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
