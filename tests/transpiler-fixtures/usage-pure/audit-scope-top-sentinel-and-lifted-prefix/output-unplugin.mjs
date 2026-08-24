import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
import _Object$isSealed from "@core-js/pure/actual/object/is-sealed";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// a FOR-INIT rest sentinel has no statement slot beside the assignment it renames: its `var`
// hoists to the scope top with the generated refs, claimed where the WALK is so it declares in
// the order the refs were pushed. the shared declaration groups by FAMILY at PROGRAM level and
// keeps push order inside a function. the consuming LIFT is also the slot a buried re-anchored
// host's prefix never had - unless that prefix is a kept WRITE, which rides the value it stored
let aP, rP, oP;
var _unused;
for (const _ref4 = (({ fromAsync: _unused, ...rP } = _globalThis.Array, aP = _Array$fromAsync), Object), isSealed = _Object$isSealed; !oP;) oP = isSealed;
const recvA = getObj();
const gA = (_ref = _getIteratorMethod(recvA)) === void 0 ? null : _ref;
let aQ, rQ, oQ;
var _unused2;
for (const _ref5 = (({ allSettled: _unused2, ...rQ } = _Promise, aQ = _Promise$allSettled), Object), isFrozen = _Object$isFrozen; !oQ;) oQ = isFrozen;
// the same pair inside a FUNCTION: push order, no family grouping
export function inFn() {
  var _ref2, _ref3;
  const recvB = getObj();
  const gB = (_ref2 = _getIteratorMethod(recvB)) === void 0 ? null : _ref2;
  let aR, rR, oR;
  var _unused3;
for (const _ref6 = (({ groupBy: _unused3, ...rR } = _Map, aR = _Map$groupBy), Object), getPrototypeOf = _Object$getPrototypeOf; !oR;) oR = getPrototypeOf;
  const recvC = getObj();
  const gC = (_ref3 = _getIteratorMethod(recvC)) === void 0 ? null : _ref3;
  return [gB, aR, rR, oR, gC];
}
// a buried re-anchored host whose SOURCE prefix the lift finally gives a statement slot
let customW, cw = 0;
({ customW } = (cw++, _Map));
export const entries = _Object$entries;
// ... and a kept WRITE is not one of those: the value it stored is what the pattern reads
let customX, wx;
({ customX } = (wx = _globalThis, _Map));
export const keys = _Object$keys;
// a chain-assignment RHS on a plain assignment host lifts the write and extracts off the value
let qS, itS;
qS = _globalThis;
itS = _getIteratorMethod(_Set);
export const r = [aP, rP, oP, gA, aQ, rQ, oQ, customW, cw, customX, wx, entries, keys, qS, itS];