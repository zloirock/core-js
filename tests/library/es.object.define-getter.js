import { DESCRIPTORS, STRICT } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('Object#__defineGetter__', function (assert) {
    var __defineGetter__ = core.Object.__defineGetter__;
    var __defineSetter__ = core.Object.__defineSetter__;
    assert.isFunction(__defineGetter__);
    var object = {};
    assert.same(__defineGetter__(object, 'key', function () {
      return 42;
    }), undefined, 'void');
    assert.same(object.key, 42, 'works');
    __defineSetter__(object, 'key', function () {
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
