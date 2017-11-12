import { DESCRIPTORS, STRICT } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('Object#__lookupGetter__', function (assert) {
    var __lookupGetter__ = Object.prototype.__lookupGetter__;
    var create = Object.create;
    assert.isFunction(__lookupGetter__);
    assert.arity(__lookupGetter__, 1);
    assert.name(__lookupGetter__, '__lookupGetter__');
    assert.looksNative(__lookupGetter__);
    assert.nonEnumerable(Object.prototype, '__lookupGetter__');
    assert.same({}.__lookupGetter__('key'), undefined, 'empty object');
    assert.same({ key: 42 }.__lookupGetter__('key'), undefined, 'data descriptor');
    var object = {};
    function setter() { /* empty */ }
    object.__defineGetter__('key', setter);
    assert.same(object.__lookupGetter__('key'), setter, 'own getter');
    assert.same(create(object).__lookupGetter__('key'), setter, 'proto getter');
    assert.same(create(object).__lookupGetter__('foo'), undefined, 'empty proto');
    if (STRICT) {
      assert.throws(function () {
        __lookupGetter__.call(null, 1, function () { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert.throws(function () {
        __lookupGetter__.call(undefined, 1, function () { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
