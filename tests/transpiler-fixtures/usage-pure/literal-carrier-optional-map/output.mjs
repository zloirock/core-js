import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// Optional method calls can expose carrier elements even after the call becomes a guard.
const box = {
  data: [10, 20]
};
const [alias] = null == (_ref = [box]) ? void 0 : _mapMaybeArray(_ref).call(_ref, value => value);
alias.data = "1020";
export const result = _includes(_ref2 = box.data).call(_ref2, "02");