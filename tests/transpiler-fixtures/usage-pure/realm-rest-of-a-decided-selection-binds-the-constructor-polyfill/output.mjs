import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a constructor read beside a rest off the realm a selection the build decides yields binds the polyfill,
// as off the realm alone
const M = _Map,
  {
    Map: _unused,
    ...rest
  } = _globalThis;
export { M, rest };