
import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: define-properties', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    Object.defineProperties(Array, { from: { value: function patched() { return 'channel'; }, configurable: true, writable: true } });
    assert.same(Array.from(), 'channel');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
