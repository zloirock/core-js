import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = [1, 2];
{
  function f(_ref = arr) {
    let at = _atMaybeArray(_ref);
    return at;
  }
}