import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// an enum member initialized by a comparison yields a runtime BOOLEAN regardless of
// operand kinds (invalid TS, but a non-type-checking parse still transforms) - no string narrow
enum E {
  C = 'a' < 'b',
}
use(_includes(_ref = E.C).call(_ref, 'x'));