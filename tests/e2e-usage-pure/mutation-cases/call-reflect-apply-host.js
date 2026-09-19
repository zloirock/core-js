import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-reflect-apply-host', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Iterator, 'zip');
  function patched() { return 'PATCHED'; }
  function set(target, value) { target.zip = value; }
  try {
    Reflect.apply(set, null, [Iterator, patched]);
    assert.same(Iterator.zip([1]), 'PATCHED');
  } finally {
    restoreProperty(Iterator, 'zip', descriptor);
  }
});
