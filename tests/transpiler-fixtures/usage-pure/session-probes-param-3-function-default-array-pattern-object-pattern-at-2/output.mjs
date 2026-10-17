import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = [1, 2];
{
  function g([{
    at
  }] = [{
    at: _atMaybeArray(arr)
  }]) {
    return at;
  }
}