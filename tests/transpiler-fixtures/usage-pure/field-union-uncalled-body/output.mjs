import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A type query cannot invoke a stored body; reading another data field stays precise.
function change() {
  this.data = foreign;
}
const box = {
  data: [10, 20]
};
// @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
box.data = '1020';
// @ts-expect-error dynamic JS adds a member the declared type lacks
box.change = change;
type Held = typeof box;
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
export const result = _includes(_ref = box.data).call(_ref, '02');