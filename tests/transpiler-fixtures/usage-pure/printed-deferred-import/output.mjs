import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A deferred namespace must not evaluate eagerly after an unrelated injection.
import defer * as ns from "printer-lazy";
export const read = () => {
  var _ref;
  return ns.read(_atMaybeArray(_ref = [7]).call(_ref, 0));
};