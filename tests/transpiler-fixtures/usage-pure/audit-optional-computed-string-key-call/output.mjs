import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// optional access through a string-literal computed key resolves to the same instance
// method as a direct dot access on a typed receiver, so both calls polyfill identically
const arr: number[] | null = null;
const a = arr == null ? void 0 : _atMaybeArray(arr).call(arr, -1);
const b = arr == null ? void 0 : _flatMaybeArray(arr).call(arr);