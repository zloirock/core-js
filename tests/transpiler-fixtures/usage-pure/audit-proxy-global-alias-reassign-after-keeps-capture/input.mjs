// `g` const-aliases the proxy-global `A` BEFORE `A` is reassigned, so `g` permanently holds the
// captured globalThis - the later `A = self` write is dead for `g`. the alias-root walk anchors its
// reassignment-dominance at the alias-read declarator, so the still-live capture resolves and
// `g.Array.from` collapses to the pure static
let A = globalThis;
const g = A;
A = self;
g.Array.from([1, 2, 3]);
