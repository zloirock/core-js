import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
export function read(arg) {
  const alias = _globalThis.window;
  const key = 'Array';
  let held;
  return [((held = null == _globalThis.window ? void 0 : _self)[key], _Array$from)(arg()), (alias.self, _Array$from)(arg()), held];
}