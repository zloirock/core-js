// TS twin of `mutated-statics.js` - bare slot WRITES reached through TS expression wrappers.
// Same quarantine rule: the mutation pre-pass is per-FILE, so mutational tests stay in the
// dedicated modules and each test restores what it writes (through a join-built key, so only
// the shape under test marks the slot).

// a TS-non-null pattern element (`[Date!] = [shim]`) is the same slot write as the plain
// element: the write target must stay verbatim (a substituted frozen import would TypeError
// at the assignment) and later reads must route the live slot. `Date` is present on every
// target engine, so the bare strict-mode write itself never ReferenceErrors
QUnit.test('mutated-statics-ts: non-null pattern element slot write routes later reads', assert => {
  const original = globalThis.Date;
  const shim = { now: () => 'wrapped-write' };
  /* eslint-disable no-global-assign -- the wrapped pattern-element write IS the case under test */
  [Date!] = [shim as never];
  /* eslint-enable no-global-assign -- end of the wrapped pattern-element write */
  try {
    assert.same(Date.now(), 'wrapped-write');
  } finally {
    globalThis[['Da', 'te'].join('') as 'Date'] = original;
  }
});

// an as-cast object-pattern value (`({ p: Set as any } = ...)`) fills the pattern slot with
// the wrapper node - the write-target reject and the slot recording must both see through it
QUnit.test('mutated-statics-ts: as-cast pattern value slot write routes later reads', assert => {
  const original = globalThis.Set;
  function ShimSet() { /* empty */ }
  ShimSet.prototype.marker = () => 'cast-write';
  /* eslint-disable no-global-assign -- the wrapped pattern-value write IS the case under test */
  ({ p: (Set as unknown) } = { p: ShimSet });
  /* eslint-enable no-global-assign -- end of the wrapped pattern-value write */
  try {
    // eslint-disable-next-line es/no-nonstandard-set-prototype-properties -- the shim's own prototype IS the case under test
    assert.same(new Set([1]).marker(), 'cast-write');
  } finally {
    globalThis[['S', 'et'].join('') as 'Set'] = original;
  }
});
