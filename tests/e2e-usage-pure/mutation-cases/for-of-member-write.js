
import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: for-of-member-write', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    for (Array.from of [function patched() { return 'channel'; }]) { /* empty */ }
    assert.same(Array.from(), 'channel');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
