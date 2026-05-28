import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// polyfilled call at file boundary - end span equals code.length, range bounds
// check keeps the emitter from queueing edits past end-of-source
const a = _at(arr).call(arr, -1);
const b = _flatMaybeArray(arr).call(arr);
_findLastMaybeArray(arr).call(arr, p)