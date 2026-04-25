import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `void 0` placeholder init treated identically to `undefined` / `null` - annotation
// drives polyfill dispatch when init is a synthetic nullish stub
const arr: string[] | undefined = void 0;
const a = arr == null ? void 0 : _includesMaybeArray(arr).call(arr, "x");
const b = arr == null ? void 0 : _atMaybeArray(arr).call(arr, 0);