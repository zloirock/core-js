import { DESCRIPTORS, STRICT } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('Object#__defineSetter__', function (assert) {
    var __defineSetter__ = Object.prototype.__defineSetter__;
    assert.isFunction(__defineSetter__);
    assert.arity(__defineSetter__, 2);
    assert.name(__defineSetter__, '__defineSetter__');
    assert.looksNative(__defineSetter__);
    assert.nonEnumerable(Object.prototype, '__defineSetter__');
    var object = {};
    assert.same(object.__defineSetter__('key', function () {
      this.foo = 43;
    }), undefined, 'void');
    object.key = 44;
    assert.same(object.foo, 43, 'works');
    object = {};
    object.__defineSetter__('key', function () {
      this.foo = 43;
    });
    object.__defineGetter__('key', function () {
      return 42;
    });
    object.key = 44;
    assert.ok(object.key === 42 && object.foo === 43, 'works with getter');
    if (STRICT) {
      assert.throws(function () {
        __defineSetter__(null, 1, function () { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert.throws(function () {
        __defineSetter__(undefined, 1, function () { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
