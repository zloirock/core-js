import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref, _ref2;
// A `.name` (MaybeFunction memoizing-get) on a proxy-global chain memoizes the receiver (`_ref = receiver`).
// The receiver's own side effect must be sourced EXACTLY ONCE - through the memo - not ALSO re-emitted as a
// prefix (which double-ran it on both emitters). When a chain-root call returning a proxy-global is harvested
// into the memo, its inner `globalThis` is rewritten to `_globalThis` (never a raw source slice -> would
// ReferenceError off-engine). distinct ctor + side-effect shape per line: hop-key SE, an inline chain-root
// call, a direct top-level SE, and a no-SE control.
let n = 0;
const hopKey = (_ref = (n += 1, _Map), _nameMaybeFunction(_ref));
const chainRoot = (_ref2 = ((() => {
  n += 10;
  return _globalThis;
})(), _Set), _nameMaybeFunction(_ref2));
const directSe = (n += 100, _nameMaybeFunction(_Promise));
const noSe = _nameMaybeFunction(_WeakMap);
export { hopKey, chainRoot, directSe, noSe, n };