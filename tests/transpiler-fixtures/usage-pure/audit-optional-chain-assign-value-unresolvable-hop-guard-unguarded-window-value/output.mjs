import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
let n;
export const unguardedWindowValue = _flatMaybeArray((n = _globalThis.window).Array.prototype).call([1, [2]]);