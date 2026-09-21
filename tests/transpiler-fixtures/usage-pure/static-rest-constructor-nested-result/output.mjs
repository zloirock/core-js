import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
var _ref;
// The inner constructor index does not replace the outer assignment result.
let race, rest;
const held = (_ref = _globalThis, {
  race,
  ...rest
} = _Promise, _ref);
export { held, race, rest };