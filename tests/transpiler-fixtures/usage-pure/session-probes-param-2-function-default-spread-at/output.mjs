import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  function f(a = [1]) {
    return a;
  }
  const v = f(...[[1, 2]]);
  _atMaybeArray(v).call(v, 0);
}