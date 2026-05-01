import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `const { prototype: name } = ...` - resolvePrototypeAsInstance reads via destructure
// when init resolves to a known constructor.
const {
  prototype: ArrPrototype
} = Array;
_atMaybeArray(ArrPrototype).call(ArrPrototype, 0);