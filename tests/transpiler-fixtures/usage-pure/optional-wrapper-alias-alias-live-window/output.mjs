import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A realm alias keeps the optional window probe; navigation must not erase it.
export function read(choice) {
  const effects = [];
  const first = _globalThis;
  const g = first;
  return null == g.window ? void 0 : _self.box;
}