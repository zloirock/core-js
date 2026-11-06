import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref;
// the root stays buried under an effect-bearing body and under a computed key carrying its own
// effect - both keep it inside the kept test, so the substitution has to reach it there too
let bodyCount = 0;
export const effectfulBodyRoot = null == (() => {
  bodyCount++;
  return _globalThis;
})()?.window ? void 0 : _findLastIndexMaybeArray(_ref = _Object$entries({
  a: 1
})).call(_ref, pair => pair[0] === 'a');