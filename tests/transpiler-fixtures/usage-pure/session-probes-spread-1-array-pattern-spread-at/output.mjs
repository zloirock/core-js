import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  const [[x]] = [...[[[1]]]];
  _atMaybeArray(x).call(x, 0);
}