import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// the same split-and-re-anchor holds a member chain on the result together
let A2;
({
  Array: A2
} = _globalThis);
export const viaSeChain = _at(_ref = _Array$from([4, 5])).call(_ref, -1);