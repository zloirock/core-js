import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
var _unused;
// A constructor entry makes its index the source of both named properties and rest.
let allSettled, inner, outer;
const held = ({} = _globalThis, {
  allSettled,
  ...inner
} = _Promise, {
  Promise: _unused,
  ...outer
} = _globalThis, _globalThis);
export { held, allSettled, inner, outer };