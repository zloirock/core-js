import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('a write through each iterated constructor keeps the patch', assert => {
  const arrayDescriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  const mapDescriptor = Object.getOwnPropertyDescriptor(Map, 'from');
  try {
    for (const c of [Array, Map]) c.from = () => 'patched';
    assert.same(Array.from([1]), 'patched');
    // eslint-disable-next-line es/no-nonstandard-map-properties -- the test installs this own property
    assert.same(Map.from([1]), 'patched');
  } finally {
    restoreProperty(Array, 'from', arrayDescriptor);
    restoreProperty(Map, 'from', mapDescriptor);
  }
});
