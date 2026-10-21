import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// Function-name helpers preserve their receiver effects once.
// Effectful realm keys keep their source read; call roots, prefixes and quiet keys remain supported.
let n = 0;
const hopKey = _nameMaybeFunction(_globalThis[n += 1, 'self'].Map);
const chainRoot = _nameMaybeFunction(((() => {
  n += 10;
  return _globalThis;
})(), _Set));
const directSe = _nameMaybeFunction((n += 100, _Promise));
const noSe = _nameMaybeFunction(_WeakMap);
export { hopKey, chainRoot, directSe, noSe, n };