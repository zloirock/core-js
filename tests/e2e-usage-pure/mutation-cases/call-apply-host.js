import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-apply-host', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Iterator, 'concat');
  function patched() { return 'PATCHED'; }
  function set(target, value) { target.concat = value; }
  try {
    set.apply(null, [Iterator, patched]);
    assert.same(Iterator.concat([1]), 'PATCHED');
  } finally {
    restoreProperty(Iterator, 'concat', descriptor);
  }
});
