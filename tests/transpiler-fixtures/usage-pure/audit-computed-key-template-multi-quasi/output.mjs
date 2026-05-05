import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// multi-quasi template literal as computed member key: `arr[`pre${'fix'}`]` should fold
// to 'prefix' when every interpolation resolves to a literal. dynamic-only interpolation
// (no statically-resolvable expression) bails the resolveKey walk and leaves the access
// untouched, with no spurious polyfill emission. distinct prototype methods per line lock
// the per-call dispatch
const arr = [1, 2, 3];
const literalKey = _flatMaybeArray(arr);
literalKey;
const dynamicKey = arr[`pre${runtime}fix`];
dynamicKey;
_includesMaybeArray(arr).call(arr, 1);