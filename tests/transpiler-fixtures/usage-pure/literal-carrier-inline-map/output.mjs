import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// A method called on a temporary carrier can return its elements for later mutation.
const box = {
  data: [10, 20]
};
const [alias] = _mapMaybeArray(_ref = [box]).call(_ref, value => value);
alias.data = "1020";
export const result = _includes(_ref2 = box.data).call(_ref2, "02");