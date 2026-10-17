import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
export function* keptGen() {
  let yv;
  yield null == (yv = _globalThis.window) ? void 0 : _flatMapMaybeArray(yv[c++, "Array"].prototype).call([2], v => [v]);
}