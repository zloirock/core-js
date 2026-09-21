import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
var _ref, _unused;
// A constructor entry makes its index the source of both named properties and rest.
let allSettled, inner, outer;
const held = (_ref = _globalThis, {
  allSettled,
  ...inner
} = _Promise, {
  Promise: _unused,
  ...outer
} = _ref, _ref);
export { held, allSettled, inner, outer };