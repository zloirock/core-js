import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `undefined` placeholder init - annotation `T | undefined` still narrows to T at the
// point of use, polyfill dispatch picks the array-specific helper
const arr: number[] | undefined = undefined;
const a = arr == null ? void 0 : _atMaybeArray(arr).call(arr, -1);
const b = arr == null ? void 0 : _flatMaybeArray(arr).call(arr);