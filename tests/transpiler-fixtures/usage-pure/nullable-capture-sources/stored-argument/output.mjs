import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A guarded argument with a stored base keeps its methods and nullish branch.
let held;
export const result = (({
  resolve
}) => resolve)(null == (held = _globalThis.window) ? void 0 : {
  resolve: _Promise$resolve
});