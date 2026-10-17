import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const c = 1;
{
  const r = (([{
    at
  }]) => at)([{
    at: _atMaybeArray(c ? [1] : [2])
  }]);
}