import { DESCRIPTORS, STRICT } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('Object#__lookupGetter__', assert => {
    const { __lookupGetter__, __defineGetter__, create } = core.Object;
    assert.isFunction(__lookupGetter__);
    assert.same(__lookupGetter__({}, 'key'), undefined, 'empty object');
    assert.same(__lookupGetter__({ key: 42 }, 'key'), undefined, 'data descriptor');
    const object = {};
    function getter() { /* empty */ }
    __defineGetter__(object, 'key', getter);
    assert.same(__lookupGetter__(object, 'key'), getter, 'own getter');
    assert.same(__lookupGetter__(create(object), 'key'), getter, 'proto getter');
    assert.same(__lookupGetter__(create(object), 'foo'), undefined, 'empty proto');
    if (STRICT) {
      assert.throws(() => {
        return __lookupGetter__(null, 1, () => { /* empty */ });
      }, TypeError, 'Throws on null as `this`');
      assert.throws(() => {
        return __lookupGetter__(undefined, 1, () => { /* empty */ });
      }, TypeError, 'Throws on undefined as `this`');
    }
  });
}
