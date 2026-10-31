import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
export const nestedBodies = (() => {
  var _ref;
  const outer = _flatMaybeArray(_ref = [1, [2]]).call(_ref);
  return outer.length ? _globalThis : null;
})()?.window?.JSON.stringify({
  a: 1
});