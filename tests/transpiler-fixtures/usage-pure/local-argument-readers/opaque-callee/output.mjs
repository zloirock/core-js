import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A bodyless signature cannot prove that the named argument stays confined.
declare function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"];
const box = {
  rows: [8, 9]
};
use(_at(_ref = pick(box)).call(_ref, -1));