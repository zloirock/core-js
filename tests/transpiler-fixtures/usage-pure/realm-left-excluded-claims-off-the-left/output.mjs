import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
// A `||` / `??` left naming a built-in the build is told not to substitute still counts as one: the data subset
// carries `Iterator`, so the right never runs and leaves with its mirror, each key claiming off the left - an
// excluded static reads the raw left (`Iterator.from`), a kept one its pure entry (`Iterator.concat`). A left the
// subset lacks at the mode (`AsyncIterator`) hands the claim to the right, which keeps its mirror (`Array.of`).
const {
  from
} = _globalThis.Iterator;
const concat = _Iterator$concat;
const {
  of
} = _globalThis.AsyncIterator || {
  of: _Array$of
};
export { from, concat, of };