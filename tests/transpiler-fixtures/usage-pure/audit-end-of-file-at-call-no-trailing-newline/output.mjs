import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Call at file boundary - end span equals code.length, range bounds check keeps
// MagicString from edits past code length
const a = _at(arr).call(arr, -1);
const b = _flatMaybeArray(arr).call(arr);
_findLastMaybeArray(arr).call(arr, p);