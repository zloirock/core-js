import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
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
export const result = box.data.includes('02');