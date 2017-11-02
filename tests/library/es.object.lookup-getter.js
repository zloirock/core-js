var test = QUnit.test;

if (DESCRIPTORS) {
  test('Object#__lookupGetter__', function (assert) {
    var __lookupGetter__ = core.Object.__lookupGetter__;
    var __defineGetter__ = core.Object.__defineGetter__;
    var create = core.Object.create;
    assert.isFunction(__lookupGetter__);
    assert.same(__lookupGetter__({}, 'key'), undefined, 'empty object');
    assert.same(__lookupGetter__({ key: 42 }, 'key'), undefined, 'data descriptor');
    var object = {};
    function getter() { /* empty */ }
    __defineGetter__(object, 'key', getter);
    assert.same(__lookupGetter__(object, 'key'), getter, 'own getter');
    assert.same(__lookupGetter__(create(object), 'key'), getter, 'proto getter');
    assert.same(__lookupGetter__(create(object), 'foo'), undefined, 'empty proto');
    if (STRICT) {
      assert['throws'](function () {
        __lookupGetter__(null, 1, function () { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert['throws'](function () {
        __lookupGetter__(undefined, 1, function () { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
