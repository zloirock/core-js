import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-call-host', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Promise, 'any');
  function patched() { return 'PATCHED'; }
  function set(target, value) { target.any = value; }
  try {
    set.call(null, Promise, patched);
    assert.same(Promise.any([]), 'PATCHED');
  } finally {
    restoreProperty(Promise, 'any', descriptor);
  }
});
