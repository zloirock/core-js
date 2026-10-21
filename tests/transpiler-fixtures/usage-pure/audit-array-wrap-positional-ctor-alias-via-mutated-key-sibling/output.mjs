import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
_globalThis.RegExp = fake;
const [{
  RegExp: RX
}, {
  WeakMap: WM
}] = [_globalThis, _globalThis];
export const viaMutatedKeySibling = new WM(entries);