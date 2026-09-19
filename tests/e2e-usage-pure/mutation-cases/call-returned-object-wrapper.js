import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-returned-object-wrapper', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'PATCHED'; }
  function bag(x) { return { x }; }
  try {
    bag(Array).x.from = patched;
    assert.same(Array.from([1]), 'PATCHED');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
