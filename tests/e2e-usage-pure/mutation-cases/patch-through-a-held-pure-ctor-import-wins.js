import { restoreProperty } from '../../helpers/restore-property.cjs';
import HeldMap from '@core-js/pure/actual/map/constructor';

// a patch through a HELD pure ctor import (the spelling a second plugin pass sees after the
// first pass minted the ctor binding): the minted-shape mutation gate must register it, so
// the read dispatches the patch - a substituted polyfill here would defeat the user's patch
QUnit.test('mutated-statics: patch through a held pure ctor import wins', assert => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(HeldMap, 'groupBy');

  HeldMap.groupBy = function patched() { return 'HELD-CTOR'; };
  try {
    assert.same(HeldMap.groupBy([], it => it), 'HELD-CTOR');
  } finally {
    restoreProperty(HeldMap, 'groupBy', originalDescriptor);
  }
});
