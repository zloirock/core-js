import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// The key changes the variable after the write has already selected its receiver.
let rows = [];
const other = {
  at: () => "other"
};
export const method = _atMaybeArray((_ref = rows, rows = other, _ref)) ?? (_ref["at"] = fallback);