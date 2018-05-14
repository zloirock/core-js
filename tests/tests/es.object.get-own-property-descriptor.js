import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Object.getOwnPropertyDescriptor', assert => {
  const { getOwnPropertyDescriptor } = Object;
  assert.isFunction(getOwnPropertyDescriptor);
  assert.arity(getOwnPropertyDescriptor, 2);
  assert.name(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
  assert.looksNative(getOwnPropertyDescriptor);
  assert.nonEnumerable(Object, 'getOwnPropertyDescriptor');
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
  assert.same(Object.getOwnPropertyDescriptor.sham, DESCRIPTORS ? undefined : true);
});
