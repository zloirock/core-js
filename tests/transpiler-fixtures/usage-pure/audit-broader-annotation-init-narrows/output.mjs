import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// broad annotation (`object`) lets the concrete init narrow the type - opposite case to
// `T | null = null`: here init is informative and annotation deliberately permissive
const arr: object = [1, 2, 3];
const a = _flatMaybeArray(arr).call(arr);
const b = _atMaybeArray(arr).call(arr, 0);