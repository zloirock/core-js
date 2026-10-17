// an effect prefix on a destructure init runs once, ahead of every read the pattern makes, wherever the
// extraction leaves it room: a statement of its own where one fits - in the block a bodyless `if` gains,
// between the halves of a split declaration - else the head of the sequence an assignment becomes, the
// first extracted initializer (in a for-init, ahead of a computed key's effect) or its place in a
// mirrored literal
function eff() {}
function pre() {}
var bm, bo;
if (globalThis) ({ Map: bm, other: bo } = (eff(), globalThis));
if (globalThis) var { Set: bs, alsoOther } = (eff(), globalThis);
var first = pre(), { WeakMap: dw, stillOther } = (eff(), globalThis);
let kk = 0;
var lead = pre(), { [(kk++, 'of')]: ko, alsoMore } = (eff(), Array);
for (var { WeakSet: fw, moreOther } = (eff(), globalThis); false;) break;
var [{ Map: aw }, alsoWrapped] = (eff(), [globalThis, 1]);
for (const { Array: { from: nf }, ...rest } = (eff(), globalThis); false;) break;
export const r = [bm, bo, bs, alsoOther, first, dw, stillOther, lead, ko, alsoMore, kk, fw, moreOther, aw, alsoWrapped, nf, rest];
