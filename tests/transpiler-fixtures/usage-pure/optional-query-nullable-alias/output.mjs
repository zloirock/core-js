import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
export function read() {
  const held = null == _globalThis.window ? void 0 : _self;
  return null == held ? void 0 : _Array$from([3]);
}