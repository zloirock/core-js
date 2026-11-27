import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('reading an inherited getter can replace an array element', assert => {
  const rows = ['word'];
  const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'slotProbe');
  try {
    // eslint-disable-next-line no-extend-native -- Install the getter read by the array.
    Object.defineProperty(Array.prototype, 'slotProbe', { configurable: true, get() {
      this[0] = [7];
    } });
    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- Read the installed getter.
    assert.same(rows.slotProbe, undefined);
    assert.same(rows[0].at(0), 7);
  } finally {
    restoreProperty(Array.prototype, 'slotProbe', descriptor);
  }
});
