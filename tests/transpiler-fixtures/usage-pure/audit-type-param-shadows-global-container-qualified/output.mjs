import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
namespace NS {
  export type Coll = number[];
}
function qualified<Coll>(x: NS.Coll) {
  return _includesMaybeArray(x).call(x, 1);
}