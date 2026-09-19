import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutation channel: invoked-free-return-caller-shadow', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'patched'; }
  try {
    function pick() { return Array; }
    // eslint-disable-next-line no-unused-vars -- the unused parameter is the scope boundary under test
    function install(Array) { pick.call(null).from = patched; }
    install({});
    assert.same(Array.from([1]), 'patched');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
