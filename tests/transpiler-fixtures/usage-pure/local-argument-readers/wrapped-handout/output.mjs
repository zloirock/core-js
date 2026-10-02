import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A non-null assertion cannot hide the named argument's opaque handout.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box = {
  rows: [8, 9]
};
mutate(box);
use(_at(_ref = pick(box!)).call(_ref, -1));