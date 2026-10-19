import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
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
export const result = box.data.includes('02');