import _globalThis from "@core-js/pure/actual/global-this";
import _Object$create from "@core-js/pure/actual/object/create";
// The earlier Object.create call retains its own prototype property.
const proto = {
  at: 13
};
export const result = _Object$create(proto).at;
if (flag) _globalThis.Object = other;