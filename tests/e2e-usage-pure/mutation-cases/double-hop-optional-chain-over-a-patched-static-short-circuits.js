import { restoreProperty } from '../../helpers/restore-property.cjs';

// a MUTATED static behind a double proxy-hop optional chain: the mutation cancels the
// always-defined claim, so the `?.` must keep its guard and bind the chain ROOT - the
// sealed emit (`((n = w)?.Array).of(1)` - the paren kills the short-circuit) threw here
// on the absent `window`, and a nav-level memo collapsed into the always-defined ponyfill
// (the guard never fired). where `window` is absent (Node) the chain must short-circuit to
// undefined; where it exists (browsers) the raw guarded nav serves the PATCH - assignment
// and prefix side effect running exactly once either way
QUnit.test('mutated-statics: double-hop optional chain over a patched static short-circuits', assert => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(Array, 'of');

  globalThis.Array.of = function patched() { return [7]; };
  const win = globalThis.window;
  const hasWindow = win !== undefined;
  try {
    let n;
    let sc = 0;
    const r = (sc++, n = globalThis.window)?.self?.self.Array.of(1).flat?.();
    if (hasWindow) assert.deepEqual(r, [7]);
    else assert.same(r, undefined);
    assert.same(n, win);
    assert.same(sc, 1);
    let v;
    const nameTail = (v = globalThis.window)?.self?.self.Set.name.at?.(0);
    assert.same(nameTail, hasWindow ? 'S' : undefined);
    assert.same(v, win);
    // the ALIAS spelling of the same root rides the same guard (the sealed emit threw here too)
    const w = globalThis.window;
    let a;
    const viaAlias = (a = w)?.self?.self.Array.of(1).flat?.();
    if (hasWindow) assert.deepEqual(viaAlias, [7]);
    else assert.same(viaAlias, undefined);
    assert.same(a, win);
  } finally {
    restoreProperty(Array, 'of', originalDescriptor);
  }
});
