import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Different constructors at each ArrayPattern-wrapped destructure: `Promise` -> `resolve`
// and `Map` -> `groupBy`. each binding extraction resolves through its dedicated constructor
// receiver, proving the static-extraction path accepts any capitalised global constructor,
// not just Array
const promiseWrap = [_Promise];
const mapWrap = [_Map];
const resolve = _Promise$resolve;
const groupBy = _Map$groupBy;
resolve(1);
groupBy([1, 2, 3], x => x);