import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a computed key that folds to a static name replays like a plain one, so it synths too;
// the NEGATIVE the shared gate keeps native is a getter-bearing literal, which is not re-eval-inert
export const viaComputedKeyFolds = (({
  ["at"]: aKey
}) => aKey)({
  at: _atMaybeArray([1, 2])
});