
import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: unknown-member-key', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    let key = 'fr';
    key += 'om';
    Array[key] = function patched() { return 'channel'; };
    assert.same(Array.from(), 'channel');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
