import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Keep the source guard and distinguish realm values from user properties.
function inner() {
  return _globalThis;
}
function outer() {
  return inner();
}
export const r = null == outer().window ? void 0 : _Array$from([3]);