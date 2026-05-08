import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// `globalThis.window.self.Array` is the same constructor at runtime; descent through known proxies must succeed.
// Walker must keep recursing whenever each intermediate key is itself a known global proxy.
const {
  window: {
    self: {
      Array
    }
  }
} = _globalThis;
const arr = _Array$from([1, 2, 3]);
export { arr };