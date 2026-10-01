import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
import _Object$isSealed from "@core-js/pure/actual/object/is-sealed";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2, _ref3, _ref4, _ref5, _unused;
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
let aP, rP, oP;
for (const _ref10 = (_ref = {
    Array: _ref2
  } = _globalThis, {} = _ref2, aP = _Array$fromAsync, {
    fromAsync: _unused,
    ...rP
  } = _ref2, _ref2, _ref, Object), isSealed = _Object$isSealed; !oP;) oP = isSealed;
const recvA = getObj();
const gA = (_ref3 = _getIteratorMethod(recvA)) === void 0 ? null : _ref3;
let aQ, rQ, oQ;
for (const _ref11 = (_ref4 = {
    Promise: _ref5
  } = {
    Promise: _Promise
  }, {
    allSettled: aQ,
    ...rQ
  } = _Promise, _ref4, Object), isFrozen = _Object$isFrozen; !oQ;) oQ = isFrozen;
// the same pair inside a FUNCTION: push order, no family grouping
export function inFn() {
  var _ref6, _ref9, _ref8, _ref7;
  const recvB = getObj();
  const gB = (_ref6 = _getIteratorMethod(recvB)) === void 0 ? null : _ref6;
  let aR, rR, oR;
  for (const _ref12 = (_ref7 = {
      Map: _ref8
    } = {
      Map: _Map
    }, {
      groupBy: aR,
      ...rR
    } = _Map, _ref7, Object), getPrototypeOf = _Object$getPrototypeOf; !oR;) oR = getPrototypeOf;
  const recvC = getObj();
  const gC = (_ref9 = _getIteratorMethod(recvC)) === void 0 ? null : _ref9;
  return [gB, aR, rR, oR, gC];
}
// a buried re-anchored host whose SOURCE prefix the lift finally gives a statement slot
let customW,
  cw = 0;
cw++;
({
  customW
} = _Map);
export const entries = _Object$entries;
// ... and a kept WRITE is not one of those: the value it stored is what the pattern reads
let customX, wx;
({
  customX
} = (wx = _globalThis, _Map));
export const keys = _Object$keys;
// a chain-assignment RHS on a plain assignment host lifts the write and extracts off the value
let qS, itS;
qS = _globalThis;
itS = _getIteratorMethod(_Set);
export const r = [aP, rP, oP, gA, aQ, rQ, oQ, customW, cw, customX, wx, entries, keys, qS, itS];