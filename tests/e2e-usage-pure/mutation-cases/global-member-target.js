import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('member target: a global static keeps its non-writable assignment throw', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  Object.defineProperty(Array, 'from', { value: descriptor && descriptor.value, configurable: true, writable: false });
  try {
    assert.throws(() => { ({ from: globalThis.Array.from } = Array); }, TypeError);
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
