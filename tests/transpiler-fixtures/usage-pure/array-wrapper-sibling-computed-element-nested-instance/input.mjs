// Nested instance leaves under computed array elements keep sibling evaluations in source order.
// Each selected element is captured once before its nested pattern, including rest siblings and
// claims in later positions. Both legs narrow proven realm receivers and dispatch opaque ones
// generically, reading each selected receiver through its capture.
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
