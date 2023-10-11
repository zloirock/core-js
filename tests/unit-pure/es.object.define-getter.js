/* eslint-disable id-match -- unification with global tests */
import { STRICT } from '../helpers/constants.js';

import __defineGetter__ from '@core-js/pure/es/object/define-getter';
import __defineSetter__ from '@core-js/pure/es/object/define-setter';

QUnit.test('Object#__defineGetter__', assert => {
  assert.isFunction(__defineGetter__);
  const object = {};
  assert.same(__defineGetter__(object, 'key', () => 42), undefined, 'void');
  assert.same(object.key, 42, 'works');
  __defineSetter__(object, 'key', function () {
    this.foo = 43;
  });
  object.key = 44;
  assert.same(object.key, 42, 'works with setter #1');
  assert.same(object.foo, 43, 'works with setter #2');
  if (STRICT) {
    assert.throws(() => __defineGetter__(null, 1, () => { /* empty */ }), TypeError, 'Throws on null as `this`');
    assert.throws(() => __defineGetter__(undefined, 1, () => { /* empty */ }), TypeError, 'Throws on undefined as `this`');
  }
});
