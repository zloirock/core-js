import _self from "@core-js/pure/actual/self";
// A realm alias keeps the optional window probe; navigation must not erase it.
export function read(choice) {
  const effects = [];
  const g = _self;
  return null == g.window ? void 0 : _self.box;
}