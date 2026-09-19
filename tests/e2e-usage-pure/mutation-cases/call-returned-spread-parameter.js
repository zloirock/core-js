import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-returned-spread-parameter', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'PATCHED'; }
  function pick(a, b) { return b; }
  try {
    // eslint-disable-next-line unicorn/no-useless-spread -- The spread is the argument channel under test.
    pick(...[1, Array]).from = patched;
    assert.same(Array.from([1]), 'PATCHED');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
