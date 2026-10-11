// the BARE binding canon reads a reassigned name the way the container walk does: an identity self-assign,
// a cross-write captured at its assignment and a write behind an effect each leave the ONE value the read
// observes, so the static binds that value's ponyfill; a branching write reads through the identity guard
// its route renders
let effCount = 0;
const eff9 = () => effCount++;
let bs1 = Object;
bs1 = bs1;
export const bareSelfAssign = bs1.fromEntries([['a', 1]]);
let bm1 = Object;
let bm2 = Promise;
bm1 = bm2;
bm2 = bm1;
export const bareCrossWrite = typeof bm1.any;
let bq1 = Object;
bq1 = (eff9(), Array);
export const bareSeWrite = typeof bq1.fromAsync;
let bBr = Object;
bBr = flag ? Reflect : Object;
export const bareBranching = typeof bBr.has;
