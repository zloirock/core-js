import _globalThis from "@core-js/pure/actual/global-this";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
_globalThis.RegExp = fake;
const [{
  RegExp: RX
}, {
  WeakMap: WM
}] = [_globalThis, {
  WeakMap: _WeakMap
}];
export const viaMutatedKeySlot = RX.escape(text);