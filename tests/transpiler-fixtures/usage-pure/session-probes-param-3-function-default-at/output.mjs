import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  function g(a = [1]) {
    _atMaybeArray(a).call(a, 0);
  }
  g();
}