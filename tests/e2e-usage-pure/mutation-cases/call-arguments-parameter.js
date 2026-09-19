import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-arguments-parameter', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'PATCHED'; }
  // eslint-disable-next-line no-unused-vars -- Names the argument slot under test.
  function install(x) {
    // eslint-disable-next-line prefer-rest-params -- The arguments slot is the channel under test.
    arguments[0].from = patched;
  }
  try {
    install(Array);
    assert.same(Array.from([1]), 'PATCHED');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
