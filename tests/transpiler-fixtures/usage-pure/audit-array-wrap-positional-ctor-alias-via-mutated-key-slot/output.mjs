import _globalThis from "@core-js/pure/actual/global-this";
// A constructor extracted from an overwritten RegExp slot keeps the user's replacement.
// Its later escape read stays native.
_globalThis.RegExp = fake;
const [{
  RegExp: RX
}, {
  WeakMap: WM
}] = [_globalThis, _globalThis];
export const viaMutatedKeySlot = RX.escape(text);