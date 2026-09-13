// Deferred and straight-line carriers preserve identical source stores and key effects.
// Their plain run ends at backed self, so the outer optional is redundant in both contexts.
// Separate bindings prevent a second write from hiding the comparison.
let a1, a2, b1, b2, out;
function eff() {}
out = () => (a1 = globalThis, a2 = a1[(eff(), 'window')].self)?.Promise.noSuchStatic;
export const straightLine = (b1 = globalThis, b2 = b1[(eff(), 'window')].self)?.Promise.noSuchStatic;
export const read = out;
