// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
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
