import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  function f({
    x
  }) {
    return x;
  }
  const v = f(...[{
    x: [1]
  }]);
  _atMaybeArray(v).call(v, 0);
}