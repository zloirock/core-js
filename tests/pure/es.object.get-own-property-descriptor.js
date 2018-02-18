import { DESCRIPTORS } from '../helpers/constants';

import getOwnPropertyDescriptor from 'core-js-pure/features/object/get-own-property-descriptor';

QUnit.test('Object.getOwnPropertyDescriptor', assert => {
  assert.isFunction(getOwnPropertyDescriptor);
  assert.arity(getOwnPropertyDescriptor, 2);
  assert.deepEqual(getOwnPropertyDescriptor({ q: 42 }, 'q'), {
    writable: true,
    enumerable: true,
    configurable: true,
    value: 42,
  });
  assert.ok(getOwnPropertyDescriptor({}, 'toString') === undefined);
  const primitives = [42, 'foo', false];
  for (const value of primitives) {
    assert.notThrows(() => getOwnPropertyDescriptor(value) || true, `accept ${ typeof value }`);
  }
  assert.throws(() => getOwnPropertyDescriptor(null), TypeError, 'throws on null');
  assert.throws(() => getOwnPropertyDescriptor(undefined), TypeError, 'throws on undefined');
});

QUnit.test('Object.getOwnPropertyDescriptor.sham flag', assert => {
  assert.same(getOwnPropertyDescriptor.sham, DESCRIPTORS ? undefined : true);
});
