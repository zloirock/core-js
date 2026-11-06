// A local function with a literal return proves the computed key overrides rows.
// Only the resulting string supplies the at receiver.
const log = [];
function key(value) {
  log.push("key");
  return "rows";
}
const box = {
  rows: [8, 9],
  [key(this)]: "ab",
  read() {
    return this.rows.at(-1);
  }
};
const r = box.read();
export { r };
export const effects = log;
