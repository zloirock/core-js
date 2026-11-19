import _globalThis from "@core-js/pure/actual/global-this";
// A write to the RegExp realm slot does not turn the neighbouring WeakMap slot into that replacement.
// Both wrapper extractions and the WeakMap construction stay native.
_globalThis.RegExp = fake;
const [{
  RegExp: RX
}, {
  WeakMap: WM
}] = [_globalThis, _globalThis];
export const viaMutatedKeySibling = new WM(entries);