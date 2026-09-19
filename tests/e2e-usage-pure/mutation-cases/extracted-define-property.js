
import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: extracted-define-property', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  try {
    const { defineProperty: define } = Object;
    define(Array, 'from', { value: function patched() { return 'channel'; }, configurable: true, writable: true });
    assert.same(Array.from(), 'channel');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
