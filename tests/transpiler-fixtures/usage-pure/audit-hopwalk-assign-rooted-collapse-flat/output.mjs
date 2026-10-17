import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A chain assignment in a proxy navigation preserves its write and effects. A collapsed backed hop must use the assigned ponyfill
// value instead of leaving a raw realm hop.
let a, b, c, d, m, n, w;
// consumed forms: an instance-method destructure keeps the collapsed receiver as the method's
// this-arg; a static-method call drops the receiver whole, keeping the assignment as the
// harvested prefix (the later root-collapse drive must defer to that wider claim)
export const flat = _flatMaybeArray((a = _globalThis, _self).Array.prototype);