// SLOT mutation through a USER-AUTHORED pure global-this import lives in its OWN module: the
// write must taint the name exactly like a bare proxy write (recognition is import-SOURCE-based,
// since the mutation prepass runs before pure-import registration), and isolation from every
// other Map write keeps the taint attributable to THIS binding - mutated-slots.js already
// taints Map through other channels, which would mask a recognition regression here.
// per-name discipline: Map = default-import channel, Set = namespace channel - one writer each
import pureGlobalThis from '@core-js/pure/full/global-this';
import * as pureGlobalThisNs from '@core-js/pure/full/global-this';

QUnit.test('mutated-slots-via-pure-import: slot write through the import binding taints bare reads', assert => {
  const original = globalThis.Map;
  function ShimMap() { this.shim = true; }
  pureGlobalThis.Map = ShimMap;
  try {
    const m = new Map([[1, 2]]);
    // eslint-disable-next-line es/no-nonstandard-map-prototype-properties -- the shim marker IS the case under test
    assert.true(m.shim);
    assert.true(m instanceof ShimMap);
  } finally {
    pureGlobalThis.Map = original;
  }
});

// the namespace channel: bundler CJS interop hangs the global on the namespace's `.default`,
// so a slot write through it must taint like the default-import write above
QUnit.test('mutated-slots-via-pure-import: slot write through the namespace .default taints bare reads', assert => {
  const original = globalThis.Set;
  function ShimSet() { this.shim = true; }
  pureGlobalThisNs.default.Set = ShimSet;
  try {
    const s = new Set([1, 2]);
    // eslint-disable-next-line es/no-nonstandard-set-prototype-properties -- the shim marker IS the case under test
    assert.true(s.shim);
    assert.true(s instanceof ShimSet);
  } finally {
    pureGlobalThisNs.default.Set = original;
  }
});
