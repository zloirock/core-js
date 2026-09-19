import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: invoked-return-object-tag', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'patched'; }
  function pick(strings, value) { return { x: value }; }
  try {
    pick`${ Array }`.x.from = patched;
    assert.same(Array.from([1]), 'patched');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
