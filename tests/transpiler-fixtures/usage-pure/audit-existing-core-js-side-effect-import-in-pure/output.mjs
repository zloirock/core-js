import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// user-written `import 'core-js/...'` (global side-effect form) inside a usage-pure
// file: the existing-import scan must recognize and preserve it, mixing the global
// side-effect import alongside the pure ESM imports the rest of the file generates
import 'core-js/actual/array/at';
const x = _flatMaybeArray(arr).call(arr);