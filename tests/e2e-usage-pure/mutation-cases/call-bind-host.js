import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-bind-host', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Promise, 'try');
  function patched() { return 'PATCHED'; }
  function set(target, value) { target.try = value; }
  try {
    set.bind(null, Promise)(patched);
    assert.same(Promise.try(() => 1), 'PATCHED');
  } finally {
    restoreProperty(Promise, 'try', descriptor);
  }
});
