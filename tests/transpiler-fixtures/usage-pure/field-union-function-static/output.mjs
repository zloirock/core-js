import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// Function-valued fields retain their declared value and Array writes; only Array includes is needed.
class Box {
  static data = function () {};
}
Box.data = [10, 20];
export const result = _includesMaybeArray(_ref = Box.data).call(_ref, "02");