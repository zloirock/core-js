import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
let effectCount = 0;
export const effectfulBody = (() => {
  var _ref;
  effectCount++;
  const inner = _includesMaybeArray(_ref = [1]).call(_ref, 1);
  return inner ? _globalThis : null;
})()?.window?.Math.max(1, 2);