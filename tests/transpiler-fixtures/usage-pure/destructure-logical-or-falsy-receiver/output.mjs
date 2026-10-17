import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Falsy literals select the logical fallback before the pattern reads its methods.
// Each fallback uses a different method, so either missing import changes the set.
const at = _atMaybeArray(0 || [1, 2]);
const includes = _includesMaybeString(false || '12');
use(at, includes);