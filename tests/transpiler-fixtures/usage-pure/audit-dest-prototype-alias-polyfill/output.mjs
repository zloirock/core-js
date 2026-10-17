import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// destructure-form of `Array.prototype`: `P.at(0)` routes through Array-specific helper
const {
  prototype: ArrProto
} = Array;
_atMaybeArray(ArrProto).call(ArrProto, 0);