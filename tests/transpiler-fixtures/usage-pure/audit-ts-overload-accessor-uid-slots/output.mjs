import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref2, _ref3;
// an overload SIGNATURE key and an `abstract accessor` key are both source-text member names, yet they
// answer the UID question in OPPOSITE directions: babel's live scope claims the bodyless signature but
// not the accessor. so the memo must step OVER `_ref` (taken by the overload) and land on `_ref2` (left
// free by the accessor) - one number proves both halves. the class overload shares its node type with a
// body-bearing method in one of the parsers, so only the missing body separates them.
// a global-shaped overload key must survive unrewritten, same as any other member name.
// distinct method per line.
class Over {
  _ref(): void;
  _ref(x?: number) {}
}
abstract class Acc {
  abstract accessor _ref2: number;
}
export const r1 = _atMaybeArray(_ref2 = [10, 20]).call(_ref2, 0);
export const r2 = _flatMaybeArray(_ref3 = [[1], [2]]).call(_ref3);
class Contract {
  Map(): void;
  Map(x?: number) {}
}
export const r3 = new _Map();
export { Over, Acc, Contract };