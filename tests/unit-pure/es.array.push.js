import { REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR } from '../helpers/constants.js';

import push from '@core-js/pure/es/array/prototype/push';

const { defineProperty } = Object;

QUnit.test('Array#push', assert => {
  assert.isFunction(push);

  const object = { length: 0x100000000 };
  assert.same(push.call(object, 1), 0x100000001, 'proper ToLength #1');
  assert.same(object[0x100000000], 1, 'proper ToLength #2');

  if (REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR) {
    assert.throws(() => push.call(defineProperty([], 'length', { writable: false }), 1), TypeError, 'non-writable length, with arg');
    assert.throws(() => push.call(defineProperty([], 'length', { writable: false })), TypeError, 'non-writable length, without arg');
  }

  assert.throws(() => push.call(null), TypeError);
  assert.throws(() => push.call(undefined), TypeError);
});
