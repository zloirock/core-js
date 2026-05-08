import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// multi-quasi template literals as computed keys: must fold when every interpolation is
// a literal (`fla${'t'}` -> 'flat'), bail when any interpolation is dynamic. plain
// instance call confirms unrelated polyfill dispatch is unaffected
const arr = [1, 2, 3];
const literalKey = _flatMaybeArray(arr);
literalKey;
const dynamicKey = arr[`pre${runtime}fix`];
dynamicKey;
_includesMaybeArray(arr).call(arr, 1);