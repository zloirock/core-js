import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A call signature does not type new: at must remain generic across array and string.
type CallOnly = {
  (): number[];
};
declare const callOnly: CallOnly;
// @ts-expect-error a function called with new is the shape under test
export const c = _at(_ref = new callOnly()).call(_ref, -1);