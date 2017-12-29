import { DESCRIPTORS, STRICT } from '../helpers/constants';

import { __defineGetter__, __defineSetter__ } from '../../ponyfill/fn/object';

if (DESCRIPTORS) {
  QUnit.test('Object#__defineSetter__', assert => {
    assert.isFunction(__defineSetter__);
    let object = {};
    assert.same(__defineSetter__(object, 'key', function () {
      this.foo = 43;
    }), undefined, 'void');
    object.key = 44;
    assert.same(object.foo, 43, 'works');
    object = {};
    __defineSetter__(object, 'key', function () {
      this.foo = 43;
    });
    __defineGetter__(object, 'key', () => 42);
    object.key = 44;
    assert.ok(object.key === 42 && object.foo === 43, 'works with getter');
    if (STRICT) {
      assert.throws(() => __defineSetter__(null, 1, () => { /* empty */ }), TypeError, 'Throws on null as `this`');
      assert.throws(() => __defineSetter__(undefined, 1, () => { /* empty */ }), TypeError, 'Throws on undefined as `this`');
    }
  });
}
