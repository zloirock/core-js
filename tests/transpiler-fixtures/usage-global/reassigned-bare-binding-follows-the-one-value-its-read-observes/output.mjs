import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the BARE binding canon shares the container walk's rules: an identity self-assign, a cross-write captured
// at its assignment and a write behind an effect each leave the one value the read observes, whose static
// loads alone; a branching write unions its arms
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