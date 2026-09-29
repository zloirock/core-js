import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A method called on a named carrier can return its elements for later mutation.
const box = {
  data: [10, 20]
};
const carrier = [box];
const [alias] = _mapMaybeArray(carrier).call(carrier, value => value);
alias.data = "1020";
export const result = _includes(_ref = box.data).call(_ref, "02");