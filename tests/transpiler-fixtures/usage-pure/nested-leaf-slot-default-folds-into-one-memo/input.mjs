// A defaulted nested receiver is captured once before its siblings and methods.
// Preserve source order and declaration kind in bodyless vars, loop heads and shared declarations.
const { y: { other: { q }, at } = dflt } = box;
const z = 1, { y: { more: { r }, flat } = dflt } = box;
var v = 2, { y: { next: { n }, find } = dflt } = box;
let w = 3, { y: { past: { p }, findLast } = dflt } = box;
if (c) var { y: { last: { s }, includes } = dflt } = box;
for (const { y: { head: { h }, entries } = dflt } = box; ;) break;
const { k, y: { tail: { u }, fill } = dflt } = box;
use(q, at, z, r, flat, v, n, find, w, p, findLast, s, includes, k, u, fill);
