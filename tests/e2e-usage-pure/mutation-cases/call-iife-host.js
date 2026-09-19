import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-iife-host', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Promise, 'allSettled');
  function patched() { return 'PATCHED'; }

  try {
    (function (target, value) { target.allSettled = value; })(Promise, patched);
    assert.same(Promise.allSettled([]), 'PATCHED');
  } finally {
    restoreProperty(Promise, 'allSettled', descriptor);
  }
});
