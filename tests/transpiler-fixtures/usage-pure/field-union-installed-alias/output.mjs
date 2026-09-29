import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// An unread body can receive the holder through a different binding.
function change() {
  this.data = '1020';
}
const box = {
  data: [10, 20]
};
const alias = box;
alias.change = change;
box.change();
export const result = _includes(_ref = box.data).call(_ref, '02');