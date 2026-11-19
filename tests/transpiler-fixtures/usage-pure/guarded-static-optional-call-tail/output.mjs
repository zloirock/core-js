import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A live optional call keeps its following member inside the guarded chain.
export function read(a) {
  return null == _globalThis.window ? void 0 : _Array$from(a).foo?.().bar;
}