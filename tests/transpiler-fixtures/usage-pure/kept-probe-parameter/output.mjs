import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A parameter default keeps its store without repeatedly refreshing its children.
// A supplied argument still owns the parameter values.
let held;
export function read({
  resolve
} = (held = _globalThis.window, {
  resolve: _Promise$resolve
})) {
  return [resolve, held];
}