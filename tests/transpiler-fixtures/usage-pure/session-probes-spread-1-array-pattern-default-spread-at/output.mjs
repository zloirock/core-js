import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  const [a = [1]] = [...[[2]]];
  _atMaybeArray(a).call(a, 0);
}