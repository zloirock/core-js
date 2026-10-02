// Returning an own method exposes it to a receiver with a different field type.
function pick(o) {
  return o.read;
}
const box = {
  rows: [8, 9],
  read() {
    return this.rows.at(-1);
  },
};
const read = pick(box);
use(read.call({ rows: "ab" }));
