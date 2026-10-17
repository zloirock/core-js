import { restoreProperty } from '../../helpers/restore-property.cjs';

// a SINGLE proxy hop under a DOUBLE `?.` over an undefinable root: the leaf swap used to
// claim the prefix always-defined and eat the ROOT guard - the chain then read a live value
// where native short-circuits to undefined on the absent `window` (Node); with `window`
// present (browsers) the surviving guard passes and the patch stays visible. covers the
// mutated AND the non-mutated leaf, and the alias spelling
QUnit.test('mutated-statics: single-hop double-optional chain keeps its root guard', assert => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'Set');
  const original = originalDescriptor && originalDescriptor.value;
  globalThis.Set = class PatchedSet extends original {};
  const win = globalThis.window;
  const hasWindow = win !== undefined;
  try {
    let v;
    assert.same((v = globalThis.window)?.self?.Set.name, hasWindow ? 'PatchedSet' : undefined);
    assert.same(v, win);
    let n;
    assert.same((n = globalThis.window)?.self?.Array.isArray([1]), hasWindow ? true : undefined);
    assert.same(n, win);
    const w = globalThis.window;
    let a;
    assert.same((a = w)?.self?.Set.name, hasWindow ? 'PatchedSet' : undefined);
    assert.same(a, win);
    // a raw mutated-static read over the same root rides the surviving guard too - the
    // patch must be LIVE here (the raw read is the point; without it `window.Array.of`
    // does not exist on ie11 and the call throws natively)
    const originalOfDescriptor = Object.getOwnPropertyDescriptor(Array, 'of');

    globalThis.Array.of = function patchedOf() { return [1]; };
    try {
      let c;
      const ofRead = (c = globalThis.window)?.Array?.of(9);
      if (hasWindow) assert.deepEqual(ofRead, [1]);
      else assert.same(ofRead, undefined);
      assert.same(c, win);
    } finally {
      restoreProperty(Array, 'of', originalOfDescriptor);
    }
    // the always-defined root keeps the leaf-swap deopt and serves the patch
    let p;
    assert.same((p = globalThis)?.self.Set.name, 'PatchedSet');
    assert.same(p, globalThis);
  } finally {
    restoreProperty(globalThis, 'Set', originalDescriptor);
  }
});
