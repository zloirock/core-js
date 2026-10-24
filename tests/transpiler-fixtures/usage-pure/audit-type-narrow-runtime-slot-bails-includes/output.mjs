import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// an enum member initialized by a comparison yields a runtime BOOLEAN regardless of
// operand kinds (invalid TS, but a non-type-checking parse still transforms) - no string narrow
// @ts-expect-error an enum member tsc refuses is the shape under test
enum E {
  C = 'a' < 'b'
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
use(_includes(_ref = E.C).call(_ref, 'x'));