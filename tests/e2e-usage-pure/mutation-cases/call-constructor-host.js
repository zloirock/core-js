import { restoreProperty } from '../../helpers/restore-property.cjs';

// A separate compilation unit and foreign cleanup leave only this call channel marking the key.
QUnit.test('mutation call channel: call-constructor-host', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Map, 'groupBy');
  function patched() { return 'PATCHED'; }
  class Setter { constructor(target, value) { target.groupBy = value; } }
  try {
    new Setter(Map, patched);
    assert.same(Map.groupBy([1], it => it), 'PATCHED');
  } finally {
    restoreProperty(Map, 'groupBy', descriptor);
  }
});
