import { restoreProperty } from '../../helpers/restore-property.cjs';

// A nested static read follows a replaced global slot, not the pristine pure constructor.
QUnit.test('mutated-statics: slot-mutated ctor shares one object across surfaces', assert => {
  function patched() { return 'patched'; }
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'Map');
  globalThis.Map = class ReplacementMap {};
  Map.groupBy = patched;
  try {
    assert.same(Map.groupBy(), 'patched');
    const { Map: { groupBy: rawRead } } = globalThis;
    assert.same(rawRead, patched);
  } finally {
    restoreProperty(globalThis, 'Map', descriptor);
  }
});
