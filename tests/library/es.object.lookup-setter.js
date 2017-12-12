import { DESCRIPTORS, STRICT } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('Object#__lookupSetter__', assert => {
    const { __lookupSetter__, __defineSetter__, create } = core.Object;
    assert.isFunction(__lookupSetter__);
    assert.same(__lookupSetter__({}, 'key'), undefined, 'empty object');
    assert.same(__lookupSetter__({ key: 42 }, 'key'), undefined, 'data descriptor');
    const object = {};
    function setter() { /* empty */ }
    __defineSetter__(object, 'key', setter);
    assert.same(__lookupSetter__(object, 'key'), setter, 'own getter');
    assert.same(__lookupSetter__(create(object), 'key'), setter, 'proto getter');
    assert.same(__lookupSetter__(create(object), 'foo'), undefined, 'empty proto');
    if (STRICT) {
      assert.throws(() => {
        return __lookupSetter__(null, 1, () => { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert.throws(() => {
        return __lookupSetter__(undefined, 1, () => { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
