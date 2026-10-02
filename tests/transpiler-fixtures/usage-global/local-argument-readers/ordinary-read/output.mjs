import "core-js/modules/es.array.at";
// A local property read does not invalidate later reads of the argument's field.
function pick(o: {
  rows: unknown;
}) {
  return o.rows;
}
const box = {
  rows: [8, 9]
};
void pick(box);
use(box.rows.at(-1));