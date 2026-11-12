import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A source-phase import must remain a module source rather than its evaluated namespace.
import source wasm from "printer.wasm";
export const read = () => {
  var _ref;
  return _atMaybeArray(_ref = [wasm]).call(_ref, 0);
};