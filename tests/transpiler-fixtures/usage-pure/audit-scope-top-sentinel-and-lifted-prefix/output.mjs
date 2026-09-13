import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
import _Object$isSealed from "@core-js/pure/actual/object/is-sealed";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
let aP, rP, oP;
for (const _ref4 = ({
    Array: {
      fromAsync: aP,
      ...rP
    }
  } = _globalThis, Object), isSealed = _Object$isSealed; !oP;) oP = isSealed;
const recvA = getObj();
const gA = (_ref = _getIteratorMethod(recvA)) === void 0 ? null : _ref;
let aQ, rQ, oQ;
for (const _ref5 = ({
    Promise: {
      allSettled: aQ,
      ...rQ
    }
  } = _globalThis, Object), isFrozen = _Object$isFrozen; !oQ;) oQ = isFrozen;
// the same pair inside a FUNCTION: push order, no family grouping
export function inFn() {
  var _ref2, _ref3;
  const recvB = getObj();
  const gB = (_ref2 = _getIteratorMethod(recvB)) === void 0 ? null : _ref2;
  let aR, rR, oR;
  for (const _ref6 = ({
      Map: {
        groupBy: aR,
        ...rR
      }
    } = _globalThis, Object), getPrototypeOf = _Object$getPrototypeOf; !oR;) oR = getPrototypeOf;
  const recvC = getObj();
  const gC = (_ref3 = _getIteratorMethod(recvC)) === void 0 ? null : _ref3;
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