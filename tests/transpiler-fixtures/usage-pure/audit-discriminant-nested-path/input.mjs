// the discriminant field may sit behind nested hops; the guard walks the field path
type U = { m: { k: 'a' }, xs: number[] } | { m: { k: 'b' }, xs: string };
function gn(u: U) { if (u.m.k === 'a') u.xs.at(0); }
// switch over a nested discriminant narrows its cases
function gs(u: U) { switch (u.m.k) { case 'a': u.xs.toReversed(); } }
// an optional-chained test still narrows the positive branch
function go(u: U) { if (u?.m?.k === 'a') u.xs.toSpliced(0, 1); }
// deeper chains walk hop by hop
type D = { a: { b: { c: 'x' } }, xs: number[] } | { a: { b: { c: 'y' } }, xs: string };
function gd(u: D) { if (u.a.b.c === 'x') u.xs.flat(); }
