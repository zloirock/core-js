import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// Function-valued fields retain their declared value and Array writes; only Array includes is needed.
const box = {
  data: function () {}
};
box.data = [10, 20];
export const result = _includesMaybeArray(_ref = box.data).call(_ref, "02");