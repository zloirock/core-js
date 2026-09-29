import _includes from "@core-js/pure/actual/instance/includes";
import _Object$assign from "@core-js/pure/actual/object/assign";
var _ref;
// Copying a carrier with Object.assign preserves its reference to the held object.
const box = {
  data: [10, 20]
};
const {
  box: alias
} = _Object$assign({}, {
  box
});
alias.data = "1020";
export const result = _includes(_ref = box.data).call(_ref, "02");