import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
const items = ['word'];
items.forEach((value, index, source) => {
  source[index] = [7];
});
export const first = items[0].at(0);
export function throughHolder() {
  const source = ['word'];
  const holder = {
    rows: source
  };
  source.forEach((value, index, row) => {
    row[index] = ['needle'];
  });
  return holder.rows[0].includes('needle');
}