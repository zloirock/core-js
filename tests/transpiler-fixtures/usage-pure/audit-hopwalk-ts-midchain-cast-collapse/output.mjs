import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// TS twin of the mid-chain wrapper collapse: a cast around the proxy-hop segment of a
// chain-assignment-rooted navigation (`((a = globalThis).self as any).Array`) is a transparent
// wrapper both collapse walks must step through; the wrapper tokens drop with the hop.
let a: any;
export const flat = _flatMaybeArray((a = _globalThis, _globalThis).Array.prototype);
export const at = _atMaybeArray((a = _globalThis, _globalThis).Array.prototype);