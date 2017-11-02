var test = QUnit.test;

if (DESCRIPTORS) {
  test('Object#__defineGetter__', function (assert) {
    var __defineGetter__ = core.Object.__defineGetter__;
    var __defineSetter__ = core.Object.__defineSetter__;
    assert.isFunction(__defineGetter__);
    var object = {};
    assert.same(__defineSetter__(object, 'key', function () {
      this.foo = 43;
    }), undefined, 'void');
    object.key = 44;
    assert.same(object.foo, 43, 'works');
    object = {};
    __defineSetter__(object, 'key', function () {
      this.foo = 43;
    });
    __defineGetter__(object, 'key', function () {
      return 42;
    });
    object.key = 44;
    assert.ok(object.key === 42 && object.foo === 43, 'works with getter');
    if (STRICT) {
      assert['throws'](function () {
        __defineSetter__(null, 1, function () { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert['throws'](function () {
        __defineSetter__(undefined, 1, function () { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
