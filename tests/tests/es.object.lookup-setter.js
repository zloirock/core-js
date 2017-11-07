var test = QUnit.test;

if (DESCRIPTORS) {
  test('Object#__lookupSetter__', function (assert) {
    var __lookupSetter__ = Object.prototype.__lookupSetter__;
    var create = Object.create;
    assert.isFunction(__lookupSetter__);
    assert.arity(__lookupSetter__, 1);
    assert.name(__lookupSetter__, '__lookupSetter__');
    assert.looksNative(__lookupSetter__);
    assert.nonEnumerable(Object.prototype, '__lookupSetter__');
    assert.same({}.__lookupSetter__('key'), undefined, 'empty object');
    assert.same({ key: 42 }.__lookupSetter__('key'), undefined, 'data descriptor');
    var object = {};
    function setter() { /* empty */ }
    object.__defineSetter__('key', setter);
    assert.same(object.__lookupSetter__('key'), setter, 'own getter');
    assert.same(create(object).__lookupSetter__('key'), setter, 'proto getter');
    assert.same(create(object).__lookupSetter__('foo'), undefined, 'empty proto');
    if (STRICT) {
      assert['throws'](function () {
        __lookupSetter__.call(null, 1, function () { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert['throws'](function () {
        __lookupSetter__.call(undefined, 1, function () { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
