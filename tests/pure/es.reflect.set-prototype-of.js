import { PROTO } from '../helpers/constants';

import setPrototypeOf from 'core-js-pure/full/reflect/set-prototype-of';

if (PROTO) QUnit.test('Reflect.setPrototypeOf', assert => {
  assert.isFunction(setPrototypeOf);
  if ('name' in setPrototypeOf) {
    assert.name(setPrototypeOf, 'setPrototypeOf');
  }
  let object = {};
  assert.ok(setPrototypeOf(object, Array.prototype), true);
  assert.ok(object instanceof Array);
  assert.throws(() => setPrototypeOf({}, 42), TypeError);
  assert.throws(() => setPrototypeOf(42, {}), TypeError, 'throws on primitive');
  object = {};
  assert.ok(setPrototypeOf(object, object) === false, 'false on recursive __proto__');
});
