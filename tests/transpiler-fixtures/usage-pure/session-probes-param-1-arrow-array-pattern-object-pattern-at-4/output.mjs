import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = [1, 2];
{
  const r = (([{
    at
  }]) => at)([{
    at: _atMaybeArray(arr)
  }]);
}