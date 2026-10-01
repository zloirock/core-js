import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// T[string] indexed access - resolves to the type's index signature when the index
// parameter is `string`. Other parsers may use a different param shape, so the check
// keys on the string-keyword token rather than the parameter wrapper.
interface Dict {
  [k: string]: number[];
}
declare const d: Dict[string];
_atMaybeArray(d).call(d, -1);