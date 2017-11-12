import { DESCRIPTORS, STRICT } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('Object#__lookupSetter__', function (assert) {
    var __lookupSetter__ = core.Object.__lookupSetter__;
    var __defineSetter__ = core.Object.__defineSetter__;
    var create = core.Object.create;
    assert.isFunction(__lookupSetter__);
    assert.same(__lookupSetter__({}, 'key'), undefined, 'empty object');
    assert.same(__lookupSetter__({ key: 42 }, 'key'), undefined, 'data descriptor');
    var object = {};
    function setter() { /* empty */ }
    __defineSetter__(object, 'key', setter);
    assert.same(__lookupSetter__(object, 'key'), setter, 'own getter');
    assert.same(__lookupSetter__(create(object), 'key'), setter, 'proto getter');
    assert.same(__lookupSetter__(create(object), 'foo'), undefined, 'empty proto');
    if (STRICT) {
      assert['throws'](function () {
        __lookupSetter__(null, 1, function () { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert['throws'](function () {
        __lookupSetter__(undefined, 1, function () { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
