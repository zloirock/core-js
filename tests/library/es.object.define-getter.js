import { DESCRIPTORS, STRICT } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('Object#__defineGetter__', assert => {
    const { __defineGetter__, __defineSetter__ } = core.Object;
    assert.isFunction(__defineGetter__);
    const object = {};
    assert.same(__defineGetter__(object, 'key', () => {
      return 42;
    }), undefined, 'void');
    assert.same(object.key, 42, 'works');
    __defineSetter__(object, 'key', function () {
      this.foo = 43;
    });
    object.key = 44;
    assert.ok(object.key === 42 && object.foo === 43, 'works with setter');
    if (STRICT) {
      assert.throws(() => {
        return __defineGetter__(null, 1, () => { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert.throws(() => {
        return __defineGetter__(undefined, 1, () => { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
