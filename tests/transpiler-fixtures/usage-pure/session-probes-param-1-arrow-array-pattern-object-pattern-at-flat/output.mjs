import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
{
  const r = (([{
    at
  }, {
    flat
  }]) => [at, flat])([{
    at: _atMaybeArray([1])
  }, {
    flat: _flatMaybeArray([[2]])
  }]);
}