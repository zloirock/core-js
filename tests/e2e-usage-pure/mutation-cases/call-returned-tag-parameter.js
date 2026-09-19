import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-returned-tag-parameter', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'PATCHED'; }
  function tag(strings, x) { return x; }
  try {
    tag`${ Array }`.from = patched;
    assert.same(Array.from([1]), 'PATCHED');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
