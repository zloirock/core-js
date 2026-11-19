import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An assignment over a literal in an unbraced body reads its nested method once before
// assigning the quiet sibling value. Both writes stay inside the conditional body.
let at, z;
const o = {
  list: [1, 2]
};
if (c) {
  at = _atMaybeArray(o.list);
  z = 1;
}
export { at, z };