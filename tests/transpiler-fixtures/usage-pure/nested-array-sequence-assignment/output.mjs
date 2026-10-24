import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A discarded assignment inside a sequence still binds both instance methods.
// Captures retain the native array levels before reading the selected receiver.
let at, flat;
const result = ([[_ref]] = [[[1, [2]]]], at = _atMaybeArray(_ref), flat = _flatMaybeArray(_ref), 7);
use(at, flat, result);