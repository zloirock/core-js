import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A proxy-global receiver carries its side effects into the function-name read exactly once.
// The helper consumes one receiver argument, so the effects stay inside it without a memo or
// a duplicate prefix. A chain-root call keeps its own global rewrite. The rows cover a hop key,
// an inline call root, a top-level sequence and an effect-free control.
let n = 0;
const hopKey = _nameMaybeFunction((n += 1, _Map));
const chainRoot = _nameMaybeFunction(((() => {
  n += 10;
  return _globalThis;
})(), _Set));
const directSe = (n += 100, _nameMaybeFunction(_Promise));
const noSe = _nameMaybeFunction(_WeakMap);
export { hopKey, chainRoot, directSe, noSe, n };