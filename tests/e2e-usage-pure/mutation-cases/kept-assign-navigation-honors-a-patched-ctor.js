import { restoreProperty } from '../../helpers/restore-property.cjs';

// a MUTATED ctor read through a kept-assign navigation: the claim machinery must NOT collapse
// `.Set` to its pristine ponyfill - the read goes through the receiver swap, so the user's
// patched class (with its own name) stays visible; the kept assignment still runs. the
// non-optional spelling survives transpile-lowering, so every leg runs it
QUnit.test('mutated-statics: kept-assign navigation honors a patched ctor', assert => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'Set');
  const original = originalDescriptor && originalDescriptor.value;
  globalThis.Set = class PatchedSet extends original {};
  let m;
  let p;
  try {
    assert.same((m = globalThis.window).self.Set.name, 'PatchedSet');
    assert.same(m, globalThis.window);
    // the resolvable-root optional spelling: lowered legs desugar it into the ternary-alias
    // shape, and the swap must still serve the patched class there
    assert.same((p = globalThis)?.self.Set.name, 'PatchedSet');
    assert.same(p, globalThis);
  } finally {
    restoreProperty(globalThis, 'Set', originalDescriptor);
  }
});
