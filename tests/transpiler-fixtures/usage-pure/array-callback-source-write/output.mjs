import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
const items = ['word'];
items.forEach((value, index, source) => {
  source[index] = [7];
});
export const first = _at(_ref = items[0]).call(_ref, 0);
export function throughHolder() {
  var _ref2;
  const source = ['word'];
  const holder = {
    rows: source
  };
  source.forEach((value, index, row) => {
    row[index] = ['needle'];
  });
  return _includes(_ref2 = holder.rows[0]).call(_ref2, 'needle');
}