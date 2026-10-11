import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect$has from "@core-js/pure/actual/reflect/has";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
// the BARE binding canon reads a reassigned name the way the container walk does: an identity self-assign,
// a cross-write captured at its assignment and a write behind an effect each leave the ONE value the read
// observes, so the static binds that value's ponyfill; a branching write reads through the identity guard
// its route renders
let effCount = 0;
const eff9 = () => effCount++;
let bs1 = Object;
bs1 = bs1;
export const bareSelfAssign = _Object$fromEntries([['a', 1]]);
let bm1 = Object;
let bm2 = _Promise;
bm1 = bm2;
bm2 = bm1;
export const bareCrossWrite = typeof _Promise$any;
let bq1 = Object;
bq1 = (eff9(), Array);
export const bareSeWrite = typeof _Array$fromAsync;
let bBr = Object;
bBr = flag ? _Reflect : Object;
export const bareBranching = typeof (bBr === _Reflect ? _Reflect$has : bBr.has);