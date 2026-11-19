import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// An effectful realm key retains the native computed read and sealed throw.
// Its independent array claim remains polyfilled before the optional test.
const effects = [];
export const value = (_globalThis[_pushMaybeArray(effects).call(effects, 'key'), 'window']?.self).Array.of(2);
export { effects };