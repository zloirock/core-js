import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A quiet trailing argument element lets earlier bound instance reads stay eager.
const result = (([{
  at
}, {
  flat
}]) => [at, flat])([{
  at: _atMaybeArray([1])
}, {
  flat: _flatMaybeArray([2])
}, 0]);
export { result };