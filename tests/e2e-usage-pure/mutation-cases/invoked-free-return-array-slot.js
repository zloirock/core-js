import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: invoked-free-return-array-slot', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'patched'; }
  try {
    function pick() { return [Array]; }
    pick.apply(null, [])[0].from = patched;
    assert.same(Array.from([1]), 'patched');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
