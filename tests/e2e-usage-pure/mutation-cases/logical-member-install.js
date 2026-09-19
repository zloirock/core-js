
import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: logical-member-install', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    Array.from ||= function patched() { return ['channel']; };
    assert.deepEqual(Array.from([7]), descriptor && descriptor.value ? [7] : ['channel']);
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
