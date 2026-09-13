import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// Both reads store a plain navigation ending at backed self. Its value is the
// realm object, so the optional over the second store is dead as well. Each
// sequence prefix still runs once before the stored value is consumed.
let c = 0;
let plain;
let probed;
export const value = _atMaybeArray((plain = (c++, _self)).Array.prototype);
export const guarded = (probed = (c++, _self), _Number$MAX_SAFE_INTEGER);