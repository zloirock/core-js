/* eslint-disable id-match -- unification with global tests */
import { STRICT } from '../helpers/constants.js';

import __defineGetter__ from 'core-js-pure/es/object/define-getter';
import __defineSetter__ from 'core-js-pure/es/object/define-setter';

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
  assert.same(object.key, 42, 'works with getter #1');
  assert.same(object.foo, 43, 'works with getter #2');
  if (STRICT) {
    assert.throws(() => __defineSetter__(null, 1, () => { /* empty */ }), TypeError, 'Throws on null as `this`');
    assert.throws(() => __defineSetter__(undefined, 1, () => { /* empty */ }), TypeError, 'Throws on undefined as `this`');
  }
});
