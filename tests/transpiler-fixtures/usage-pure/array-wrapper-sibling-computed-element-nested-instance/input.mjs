// A nested instance leaf under an array wrapper whose paired element the source computes (a call,
// a selection, an optional chain) beside a SIBLING slot: the wrapper capture takes the whole literal
// once, position for position (`const [_ref, t1] = [realm(), eff('t1')]`), so every element reads in
// source order ahead of the per-element patterns, and the nested claim then extracts off its own
// captured slot - a rest sibling and a claim in the second slot ride the same capture. Both legs
// inject; the babel leg narrows the dispatcher to the Array variant where the captured element
// resolves to the global object (its typed re-anchor), the unplugin leg dispatches generically.
const seen = [];
const eff = t => (seen.push(t), t);
const realm = () => globalThis;
const opaque = () => JSON.parse('{}');
const c = seen.length === 0;
const [{ Array: { prototype: { at: a1 } } }, t1] = [realm(), eff('t1')];
const [{ Array: { prototype: { at: a2 } } }, t2] = [opaque(), eff('t2')];
const [{ Array: { prototype: { at: a3 } } }, t3] = [(c ? globalThis : realm()), eff('t3')];
const [{ Array: { prototype: { at: a4 } } }, t4] = [globalThis.window?.self, eff('t4')];
const [{ Array: { prototype: { at: a5 } } }, ...r5] = [realm(), eff('t5')];
const [t6, { Array: { prototype: { at: a6 } } }] = [eff('t6'), realm()];
export { a1, t1, a2, t2, a3, t3, a4, t4, a5, r5, a6, t6, seen };
