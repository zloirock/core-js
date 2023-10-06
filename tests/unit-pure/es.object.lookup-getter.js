/* eslint-disable id-match -- unification with global tests */
import { STRICT } from '../helpers/constants.js';

import create from 'core-js-pure/es/object/create';
import __defineGetter__ from 'core-js-pure/es/object/define-getter';
import __lookupGetter__ from 'core-js-pure/es/object/lookup-getter';

QUnit.test('Object#__lookupGetter__', assert => {
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
    assert.throws(() => __lookupGetter__(null, 1, () => { /* empty */ }), TypeError, 'Throws on null as `this`');
    assert.throws(() => __lookupGetter__(undefined, 1, () => { /* empty */ }), TypeError, 'Throws on undefined as `this`');
  }
});
