import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  const [a = [1]] = [...[undefined]];
  _atMaybeArray(a).call(a, 0);
}