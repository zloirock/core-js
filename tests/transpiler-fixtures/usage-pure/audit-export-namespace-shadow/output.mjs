import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `export * as Ns` adds Ns to the binding-name set so the polyfill UID generator
// can't accidentally collide. polyfill emission for the local Array methods must
// not collide with the namespace-export local
export * as Ns from './ns.js';
const arr = [1, 2, 3];
_includesMaybeArray(arr).call(arr, 1);
_flatMaybeArray(arr).call(arr);