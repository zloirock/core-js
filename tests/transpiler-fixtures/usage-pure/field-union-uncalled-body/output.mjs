import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A type query cannot invoke a stored body; reading another data field stays precise.
function change() {
  this.data = foreign;
}
const box = {
  data: [10, 20]
};
box.data = '1020';
box.change = change;
type Held = typeof box;
export const result = _includes(_ref = box.data).call(_ref, '02');