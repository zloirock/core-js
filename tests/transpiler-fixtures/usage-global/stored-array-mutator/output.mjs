import "core-js/modules/es.array.at";
import "core-js/modules/es.array.unshift";
import "core-js/modules/es.string.at";
const holder = {
  rows: ['word']
};
holder.rows.unshift([7]);
export const first = holder.rows[0].at(0);