import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A flat inline spread preserves the complete argument window for both instance reads.
const result = (([{
  at
}, {
  flat
}]) => [at, flat])([{
  at: _atMaybeArray([1])
}, ...[{
  flat: _flatMaybeArray([2])
}]]);
export { result };