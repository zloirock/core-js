
import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: update-member-write', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    ++Array.from;
    assert.true(Number.isNaN(Array.from));
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
