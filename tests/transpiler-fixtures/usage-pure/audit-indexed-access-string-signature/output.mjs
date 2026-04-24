import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// T[string] indexed access - picks up TSIndexSignature with string parameter.
// only TSStringKeyword check is structural-exact; Flow/oxc param shape may differ.
interface Dict {
  [k: string]: number[];
}
declare const d: Dict[string];
_atMaybeArray(d).call(d, -1);