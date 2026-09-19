import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-tag-host', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Iterator, 'from');
  function patched() { return 'PATCHED'; }
  function tag(strings, target, value) { target.from = value; }
  try {
    tag`${ Iterator }${ patched }`;
    assert.same(Iterator.from([1]), 'PATCHED');
  } finally {
    restoreProperty(Iterator, 'from', descriptor);
  }
});
