import "core-js/modules/es.array.at";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.string.at";
// The callback can call a method of its source array through a TypeScript assertion.
const rows = ['word'];
rows.reduce((sum, value, index, source) => {
  (source.fill as Function)([7]);
  return sum;
}, 0);
export const first = rows[0].at(0);