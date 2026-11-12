import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Dynamic import phases survive a printing transform independently of static imports.
export const read = () => import.defer("printer-lazy").then(ns => {
  var _ref;
  return ns.read(_atMaybeArray(_ref = [7]).call(_ref, 0));
});
export const source = () => import.source("printer.wasm");