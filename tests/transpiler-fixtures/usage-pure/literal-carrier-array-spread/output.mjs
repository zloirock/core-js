import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// An array spread exposes the objects stored in the array.
const box = {
  data: [10, 20]
};
const [alias] = [...[box]];
alias.data = "1020";
export const result = _includes(_ref = box.data).call(_ref, "02");