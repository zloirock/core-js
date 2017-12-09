/* eslint-disable camelcase */
import { DESCRIPTORS, STRICT } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('Object#__defineGetter__', assert => {
    const { __defineGetter__ } = Object.prototype;
    assert.isFunction(__defineGetter__);
    assert.arity(__defineGetter__, 2);
    assert.name(__defineGetter__, '__defineGetter__');
    assert.looksNative(__defineGetter__);
    assert.nonEnumerable(Object.prototype, '__defineGetter__');
    const object = {};
    assert.same(object.__defineGetter__('key', () => 42), undefined, 'void');
    assert.same(object.key, 42, 'works');
    object.__defineSetter__('key', function () {
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
