import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: invoked-free-return-opaque-args', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'patched'; }
  try {
    const args = [];
    // eslint-disable-next-line no-unused-vars -- the unused parameter is the scope boundary under test
    function pick(ignored) { return Array; }
    // eslint-disable-next-line prefer-spread -- the opaque apply list is the channel under test
    pick.apply(null, args).from = patched;
    assert.same(Array.from([1]), 'patched');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
