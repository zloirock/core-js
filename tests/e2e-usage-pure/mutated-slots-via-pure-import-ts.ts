// the TS require-import channel of the pure global-this SLOT mutation - its own module for
// the same isolation reason as the ESM twin. the `.ts` extension keeps the shape alive into
// the transform on the legs that see the original source, while babel's TS lowering turns it
// into the require-var form for the post leg - one test locks BOTH recognition channels
import pureGlobalThis = require('@core-js/pure/full/global-this');

QUnit.test('mutated-slots-via-pure-import-ts: slot write through import= taints bare reads', assert => {
  const original = globalThis.Map;
  function ShimMap(this: { shim: boolean }) { this.shim = true; }
  pureGlobalThis.Map = ShimMap as never;
  try {
    const m = new Map([[1, 2]]);
    // eslint-disable-next-line es/no-nonstandard-map-prototype-properties -- the shim marker IS the case under test
    assert.true((m as { shim?: boolean }).shim);
    assert.true(m instanceof (ShimMap as never));
  } finally {
    pureGlobalThis.Map = original;
  }
});
