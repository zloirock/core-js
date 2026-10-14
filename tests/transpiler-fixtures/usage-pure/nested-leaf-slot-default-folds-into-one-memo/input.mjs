// a default on the hop a nested leaf hangs off folds into the twin's one read: the memo holds the slot's
// value or the default, and the leaf binds off it in source order. an unbraced `var` takes a block for the
// memo; a loop head and a shared declaration take it as a declarator, and a shared declaration split per
// statement declares it `const` whatever the host's kind
const { y: { other: { q }, at } = dflt } = box;
const z = 1, { y: { more: { r }, flat } = dflt } = box;
var v = 2, { y: { next: { n }, find } = dflt } = box;
let w = 3, { y: { past: { p }, findLast } = dflt } = box;
if (c) var { y: { last: { s }, includes } = dflt } = box;
for (const { y: { head: { h }, entries } = dflt } = box; ;) break;
const { k, y: { tail: { u }, fill } = dflt } = box;
use(q, at, z, r, flat, v, n, find, w, p, findLast, s, includes, k, u, fill);
