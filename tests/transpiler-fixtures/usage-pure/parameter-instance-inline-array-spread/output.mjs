import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A nested parameter pattern pairs through a pristine inline-array spread.
// Its final quiet receiver can supply a data slot without a deferred accessor.
const array = (([{
  at
}]) => at)([...[{
  at: _atMaybeArray([1, 2])
}]]);
const string = (([{
  includes
}]) => includes)([...[{
  includes: _includesMaybeString('ab')
}]]);
export { array, string };