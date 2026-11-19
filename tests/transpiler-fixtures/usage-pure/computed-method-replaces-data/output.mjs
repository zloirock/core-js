import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A local function with a literal return proves the computed method key overrides rows.
// The rewritten lookup must preserve the missing-method TypeError.
const log = [];
function key(value) {
  _pushMaybeArray(log).call(log, "key");
  return "rows";
}
const box = {
  rows: [8, 9],
  [key(this)]() {},
  read() {
    return this.rows.at(0);
  }
};
let r;
try {
  r = box.read();
} catch {
  r = "threw";
}
export { r };
export const effects = log;