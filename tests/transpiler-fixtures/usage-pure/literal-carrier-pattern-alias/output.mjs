import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A destructured carrier slot binds the object itself; writes through that alias remain visible.
const box = {
  data: [10, 20]
};
const {
  box: alias
} = {
  box
};
alias.data = "1020";
export const result = _includes(_ref = box.data).call(_ref, "02");