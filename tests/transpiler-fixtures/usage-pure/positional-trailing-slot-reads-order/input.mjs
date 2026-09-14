// The positional route renames the claimed array slot and reads it after the pattern binds. A slot
// AFTER the claim's that reads or evaluates when the pattern binds - a nested pattern, a default,
// a rest that destructures - would then run before the claim's own read, where native reads the
// claim's level first; those keep the pattern native. A bare binding, a plain rest and a reader
// BEFORE the claim keep the rename.
const seen = [];
const mk = () => ({ get y() { seen.push('y'); return [7, 8]; } });
const box = { get z() { seen.push('z'); return 2; } };
const pair = [mk(), box];
const solo = [mk()];
const [{ y: { at: a1 } }, { z: z1 }] = pair;
const [{ y: { at: a2 } }, t2 = seen.push('d')] = solo;
const [{ y: { at: a3 } }, ...[{ z: z3 }]] = pair;
const [{ y: { at: a4 } }, t4] = pair;
const [{ y: { at: a5 } }, ...r5] = pair;
const [{ z: z6 }, { y: { at: a6 } }] = pair.slice().reverse();
let a7, z7;
[{ y: { at: a7 } }, { z: z7 }] = pair;
export { a1, z1, a2, t2, a3, z3, a4, t4, a5, r5, a6, z6, a7, z7, seen };
