import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// The inner constructor index does not replace the outer assignment result.
let race, rest;
const held = ({
  race,
  ...rest
} = _Promise, _globalThis);
export { held, race, rest };