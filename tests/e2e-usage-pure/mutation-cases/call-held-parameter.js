import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-held-parameter', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'PATCHED'; }
  let held;
  function keep(x) { held = x; }
  try {
    keep(Array);
    held.from = patched;
    assert.same(Array.from([1]), 'PATCHED');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
