
import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: for-in-member-write', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    for (Array.from in { channel: 1 }) { /* empty */ }
    assert.same(Array.from, 'channel');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
