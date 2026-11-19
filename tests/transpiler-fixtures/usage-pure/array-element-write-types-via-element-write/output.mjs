import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A single direct write supplies the element type at the later read.
// Mutators and escapes below keep the generic dispatcher; read-only uses stay precise.
const written = [1, 2];
written[0] = 'x';
export const viaElementWrite = _atMaybeString(_ref = written[0]).call(_ref, 0);