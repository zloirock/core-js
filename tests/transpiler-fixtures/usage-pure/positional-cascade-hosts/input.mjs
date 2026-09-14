// Several positional claims in one array pattern: a later slot's rename frees the earlier slots
// (they declined while the later slot still read as a pattern), on every host and through every
// array level, and the extractions keep the source order. Both legs cascade the same way.
const seen = [];
const mk = () => ({ get y() { seen.push('y'); return [7, 8]; } });
const rows = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12]];
const pair = [mk(), { get z() { seen.push('z'); return [1]; } }];
const nested = [[mk()], [[3, 4]]];
const [{ at: a1 }, { at: b1 }, { at: c1 }, { at: d1 }, { at: e1 }, { at: f1 }] = rows;
let a2, b2, c2;
[{ at: a2 }, { at: b2 }, { at: c2 }] = rows;
const [{ at: a3 }, , { at: c3 }] = rows;
const [{ at: a4 }, { at: b4 }, ...rest4] = rows;
const [[{ y: { at: a5 } }], [{ at: b5 }]] = nested;
export const [{ at: a6 }, { includes: b6 }] = rows;
let r7;
for (const [{ at: a7 }, { includes: b7 }] of [rows]) r7 = [a7, b7];
let r8;
for (const [{ at: a8 }, { includes: b8 }] = rows; !r8;) r8 = [a8, b8];
let r9;
if (rows) { const [{ at: a9 }, { includes: b9 }] = rows; r9 = [a9, b9]; }
const x10 = 1, [{ at: a10 }, { includes: b10 }] = rows, y10 = 2;
const [{ y: { at: a11 } }, { z: { includes: b11 } }] = pair;
export { a1, b1, c1, d1, e1, f1, a2, b2, c2, a3, c3, a4, b4, rest4, a5, b5, r7, r8, r9, x10, a10, b10, y10, a11, b11, seen };
