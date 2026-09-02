import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a destructure that CONSUMES its init discards the read the source performed on an inline kept
// STORE, and off-realm that read is what throws: the probe channel re-emits it, respelled from the
// seal the source wrote and carrying the store itself, so the write still runs exactly once. the
// holder's spelling is not the question - a named binding and an inline store hold a value alike
let w1, w2, w3, w4;
const M = ((w1 = _globalThis.window).self, _Map);
const ofOverHop = ((w2 = _globalThis.window).self, _Array$of);
const ofDirect = ((w3 = _globalThis.window).Array, _Array$of);
let assigned;
assigned = ((w4 = _globalThis.window).self, _Array$of);
// a store the realm ALWAYS fills has nothing to throw: the read over it is the vacuous one and
// only the write survives
let g;
g = _globalThis;
const from = _Array$from;
export { M, ofOverHop, ofDirect, assigned, from, w1, w2, w3, w4, g };